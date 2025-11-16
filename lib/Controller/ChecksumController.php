<?php

declare(strict_types=1);

namespace OCA\Checksum\Controller;

use OC\User\NoUserException;
use OCA\Checksum\AppInfo\Application;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\JSONResponse;
use OCP\Files\FileInfo;
use OCP\Files\IRootFolder;
use OCP\Files\NotFoundException;
use OCP\Files\NotPermittedException;
use OCP\IL10N;
use OCP\IRequest;
use OCP\IUserSession;
use OCP\L10N\IFactory;

class ChecksumController extends Controller {

	/**
	 * @var IL10N
	 */
	private $language;

	/**
	 * @var IRootFolder
	 */
	private $rootFolder;

	/**
	 * @var IUserSession
	 */
	private $userSession;

	/**
	 * ChecksumController constructor.
	 *
	 * @param string $appName
	 * @param IRequest $request
	 * @param IFactory $languageFactory
	 * @param IRootFolder $rootFolder
	 * @param IUserSession $userSession
	 */
	public function __construct(
		string $appName,
		IRequest $request,
		IFactory $languageFactory,
		IRootFolder $rootFolder,
		IUserSession $userSession
	) {
		parent::__construct($appName, $request);

		$this->language = $languageFactory->get(Application::APP_ID);
		$this->rootFolder = $rootFolder;
		$this->userSession = $userSession;
	}

	/**
	 * Compute the hash of a file.
	 *
	 * @NoAdminRequired
	 * @param string $source file path relative to user home
	 * @param string $type hash algorithm
	 * @param int|null $byteStart optional start byte offset
	 * @param int|null $byteEnd optional end byte offset
	 * @return JSONResponse
	 */
	public function check(string $source, string $type, ?int $byteStart = null, ?int $byteEnd = null): JSONResponse {
		if (!$this->checkAlgorithmType($type)) {
			return new JSONResponse(
				[
					'response' => 'error',
					'msg' => $this->language->t(
						'The algorithm type "%s" is not a valid or supported algorithm type.',
						[$type]
					)
				]
			);
		}

		// Validate byte range parameters
		if ($byteStart !== null && $byteStart < 0) {
			return new JSONResponse(
				[
					'response' => 'error',
					'msg' => $this->language->t('Start byte must be 0 or greater.')
				]
			);
		}

		if ($byteEnd !== null && $byteEnd < 0) {
			return new JSONResponse(
				[
					'response' => 'error',
					'msg' => $this->language->t('End byte must be 0 or greater.')
				]
			);
		}

		if ($byteStart !== null && $byteEnd !== null && $byteStart >= $byteEnd) {
			return new JSONResponse(
				[
					'response' => 'error',
					'msg' => $this->language->t('Start byte must be less than end byte.')
				]
			);
		}

		$hash = $this->getHash($source, $type, $byteStart, $byteEnd);
		if ($hash) {
			return new JSONResponse(
				[
					'response' => 'success',
					'msg' => $hash
				]
			);
		}

		return new JSONResponse(
			[
				'response' => 'error',
				'msg' => $this->language->t('File not found.')
			]
		);
	}

	private function getHash(string $source, string $type, ?int $byteStart = null, ?int $byteEnd = null): ?string {
		$user = $this->userSession->getUser();
		if (!$user) {
			return null;
		}

		try {
			$home = $this->rootFolder->getUserFolder($user->getUID());
			/** @var \OC\Files\Node\File $node */
			$node = $home->get($source);
		} catch (NotPermittedException | NoUserException | NotFoundException $e) {
			return null;
		}

		if ($node->getType() !== FileInfo::TYPE_FILE) {
			return null;
		}

		$file = $node->fopen('rb');
		if (!$file) {
			return null;
		}

		$hash = hash_init($type);

		// If byte range is specified, read only that portion
		if ($byteStart !== null || $byteEnd !== null) {
			$fileSize = $node->getSize();
			$start = $byteStart ?? 0;
			$end = $byteEnd ?? $fileSize;

			// Validate that the range is within file bounds
			if ($start >= $fileSize) {
				fclose($file);
				return null;
			}

			// Adjust end if it exceeds file size
			$end = min($end, $fileSize);

			// Seek to start position
			if ($start > 0) {
				fseek($file, $start);
			}

			// Read in chunks up to the end position
			$bytesToRead = $end - $start;
			$chunkSize = 8192; // 8KB chunks

			while ($bytesToRead > 0 && !feof($file)) {
				$currentChunkSize = min($chunkSize, $bytesToRead);
				$chunk = fread($file, $currentChunkSize);
				
				if ($chunk === false) {
					break;
				}
				
				hash_update($hash, $chunk);
				$bytesToRead -= strlen($chunk);
			}
		} else {
			// Read entire file
			hash_update_stream($hash, $file);
		}

		fclose($file);

		return hash_final($hash);
	}

	private function checkAlgorithmType(string $type): bool {
		return in_array($type, $this->getAllowedAlgorithmTypes()) && in_array($type, hash_algos());
	}

	/**
	 * @return array<string>
	 */
	private function getAllowedAlgorithmTypes(): array {
		return [
			'md5',
			'sha1',
			'sha256',
			'sha384',
			'sha512',
			'sha3-256',
			'sha3-512',
			'crc32',
			'crc32b'
		];
	}
}
