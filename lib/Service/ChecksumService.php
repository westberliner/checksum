<?php

declare(strict_types=1);

namespace OCA\Checksum\Service;

use OC\User\NoUserException;
use OCP\Files\File;
use OCP\Files\IRootFolder;
use OCP\Files\NotFoundException;
use OCP\Files\NotPermittedException;
use OCP\IUserSession;

class ChecksumService {

	private const CHUNK_SIZE = 8192;

	private const ALLOWED_ALGORITHMS = [
		'md5',
		'sha1',
		'sha256',
		'sha384',
		'sha512',
		'sha3-256',
		'sha3-512',
		'crc32',
		'crc32b',
	];

	public function __construct(
		private IRootFolder $rootFolder,
		private IUserSession $userSession,
	) {
	}

	public function isValidAlgorithm(string $algorithm): bool {
		return in_array($algorithm, self::ALLOWED_ALGORITHMS, true)
			&& in_array($algorithm, hash_algos(), true);
	}

	/**
	 * @return array<string>
	 */
	public function getAllowedAlgorithms(): array {
		return self::ALLOWED_ALGORITHMS;
	}

	/**
	 * @throws NotFoundException
	 * @throws NotPermittedException
	 */
	public function computeHash(string $path, string $algorithm, ?int $byteStart = null, ?int $byteEnd = null): string {
		$file = $this->resolveFile($path);
		$stream = $this->openStream($file);

		try {
			return $byteStart !== null || $byteEnd !== null
				? $this->hashRange($stream, $algorithm, $byteStart, $byteEnd, $file->getSize())
				: $this->hashFull($stream, $algorithm);
		} finally {
			fclose($stream);
		}
	}

	/**
	 * @throws NotFoundException
	 * @throws NotPermittedException
	 */
	private function resolveFile(string $path): File {
		$user = $this->userSession->getUser();
		if ($user === null) {
			throw new NotPermittedException('No authenticated user');
		}

		try {
			$node = $this->rootFolder->getUserFolder($user->getUID())->get($path);
		} catch (NoUserException $e) {
			throw new NotPermittedException($e->getMessage(), 0, $e);
		}

		if (!$node instanceof File) {
			throw new NotFoundException("$path is not a file");
		}

		return $node;
	}

	/**
	 * @return resource
	 * @throws NotFoundException
	 */
	private function openStream(File $file): mixed {
		$stream = $file->fopen('rb');
		if ($stream === false) {
			throw new NotFoundException('Could not open file for reading');
		}
		return $stream;
	}

	/**
	 * @param resource $stream
	 */
	private function hashFull(mixed $stream, string $algorithm): string {
		$hash = hash_init($algorithm);
		hash_update_stream($hash, $stream);
		return hash_final($hash);
	}

	/**
	 * @param resource $stream
	 */
	private function hashRange(mixed $stream, string $algorithm, ?int $byteStart, ?int $byteEnd, int $fileSize): string {
		$start = $byteStart ?? 0;
		$end = min($byteEnd ?? $fileSize, $fileSize);

		if ($start > 0) {
			fseek($stream, $start);
		}

		$hash = hash_init($algorithm);
		$remaining = $end - $start;

		while ($remaining > 0 && !feof($stream)) {
			$chunk = fread($stream, min(self::CHUNK_SIZE, $remaining));
			if ($chunk === false) {
				break;
			}
			hash_update($hash, $chunk);
			$remaining -= strlen($chunk);
		}

		return hash_final($hash);
	}
}
