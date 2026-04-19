<?php

declare(strict_types=1);

namespace OCA\Checksum\Controller;

use OCA\Checksum\AppInfo\Application;
use OCA\Checksum\Service\ChecksumService;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\JSONResponse;
use OCP\Files\NotFoundException;
use OCP\Files\NotPermittedException;
use OCP\IL10N;
use OCP\IRequest;
use OCP\L10N\IFactory;

class ChecksumController extends Controller {

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
	 * @NoAdminRequired
	 * @param string $source file path relative to user home
	 * @param string $type hash algorithm
	 * @param int|null $byteStart optional start byte offset
	 * @param int|null $byteEnd optional end byte offset
	 * @return JSONResponse
	 */
	public function check(string $source, string $type, ?int $byteStart = null, ?int $byteEnd = null): JSONResponse {
		if (!$this->checksumService->isValidAlgorithm($type)) {
			return new JSONResponse([
				'response' => 'error',
				'msg' => $this->language->t(
					'The algorithm type "%s" is not a valid or supported algorithm type.',
					[$type]
				),
			]);
		}

		if ($byteStart !== null && $byteStart < 0) {
			return new JSONResponse([
				'response' => 'error',
				'msg' => $this->language->t('Start byte must be 0 or greater.'),
			]);
		}

		if ($byteEnd !== null && $byteEnd < 0) {
			return new JSONResponse([
				'response' => 'error',
				'msg' => $this->language->t('End byte must be 0 or greater.'),
			]);
		}

		if ($byteStart !== null && $byteEnd !== null && $byteStart >= $byteEnd) {
			return new JSONResponse([
				'response' => 'error',
				'msg' => $this->language->t('Start byte must be less than end byte.'),
			]);
		}

		try {
			$hash = $this->checksumService->computeHash($source, $type, $byteStart, $byteEnd);
		} catch (NotFoundException|NotPermittedException) {
			return new JSONResponse([
				'response' => 'error',
				'msg' => $this->language->t('File not found.'),
			]);
		}

		return new JSONResponse([
			'response' => 'success',
			'msg' => $hash,
		]);
	}
}
