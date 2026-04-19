<?php

declare(strict_types=1);

namespace OCA\Checksum\Controller;

use OCA\Checksum\AppInfo\Application;
use OCA\Checksum\Service\ChecksumService;
use OCP\AppFramework\Http;
use OCP\AppFramework\Http\Attribute\NoAdminRequired;
use OCP\AppFramework\Http\Attribute\NoCSRFRequired;
use OCP\AppFramework\Http\DataResponse;
use OCP\AppFramework\OCSController;
use OCP\Files\NotFoundException;
use OCP\Files\NotPermittedException;
use OCP\IL10N;
use OCP\IRequest;
use OCP\L10N\IFactory;

class ChecksumApiController extends OCSController {

	private IL10N $language;

	public function __construct(
		string $appName,
		IRequest $request,
		IFactory $languageFactory,
		private ChecksumService $checksumService,
	) {
		parent::__construct($appName, $request);
		$this->language = $languageFactory->get(Application::APP_ID);
	}

	/**
	 * Compute the checksum of a file by its path in the user's storage.
	 *
	 * Example:
	 *   GET /ocs/v2.php/apps/checksum/api/v1/checksum
	 *       ?path=/Documents/data.csv&algorithm=sha256
	 *       &format=json
	 *
	 * @NoAdminRequired
	 * @NoCSRFRequired
	 *
	 * @param string $path      file path relative to the user's home folder
	 * @param string $algorithm hash algorithm (md5, sha1, sha256, sha384, sha512, sha3-256, sha3-512, crc32, crc32b)
	 * @param int|null $byteStart optional start byte offset for partial hashing
	 * @param int|null $byteEnd   optional end byte offset for partial hashing
	 * @return DataResponse<Http::STATUS_OK, array{checksum: string, algorithm: string, path: string}, array{}>
	 *       | DataResponse<Http::STATUS_BAD_REQUEST, array{error: string}, array{}>
	 *       | DataResponse<Http::STATUS_NOT_FOUND, array{error: string}, array{}>
	 */
	#[NoAdminRequired]
	#[NoCSRFRequired]
	public function compute(
		string $path,
		string $algorithm,
		?int $byteStart = null,
		?int $byteEnd = null,
	): DataResponse {
		if (!$this->checksumService->isValidAlgorithm($algorithm)) {
			return new DataResponse(
				['error' => $this->language->t(
					'The algorithm type "%s" is not a valid or supported algorithm type.',
					[$algorithm]
				)],
				Http::STATUS_BAD_REQUEST,
			);
		}

		if ($byteStart !== null && $byteStart < 0) {
			return new DataResponse(
				['error' => $this->language->t('Start byte must be 0 or greater.')],
				Http::STATUS_BAD_REQUEST,
			);
		}

		if ($byteEnd !== null && $byteEnd < 0) {
			return new DataResponse(
				['error' => $this->language->t('End byte must be 0 or greater.')],
				Http::STATUS_BAD_REQUEST,
			);
		}

		if ($byteStart !== null && $byteEnd !== null && $byteStart >= $byteEnd) {
			return new DataResponse(
				['error' => $this->language->t('Start byte must be less than end byte.')],
				Http::STATUS_BAD_REQUEST,
			);
		}

		try {
			$checksum = $this->checksumService->computeHash($path, $algorithm, $byteStart, $byteEnd);
		} catch (NotFoundException|NotPermittedException) {
			return new DataResponse(
				['error' => $this->language->t('File not found.')],
				Http::STATUS_NOT_FOUND,
			);
		}

		return new DataResponse([
			'checksum' => $checksum,
			'algorithm' => $algorithm,
			'path' => $path,
		]);
	}
}
