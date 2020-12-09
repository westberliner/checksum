<?php

declare(strict_types=1);

/**
 * @copyright Copyright (C) 2020 Richard Steinmetz <richard@steinmetz.cloud>
 *
 * @author westberliner
 * @author Richard Steinmetz <richard@steinmetz.cloud>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

namespace OCA\Checksum\Controller;

use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\JSONResponse;
use OCP\Files\Mount\IMountManager;
use OCP\IL10N;
use OCP\IRequest;
use OCP\IUserSession;
use OCP\L10N\IFactory;

class ChecksumController extends Controller {
	/**
	 * @var IL10N
	 */
	private IL10N $language;

	/**
	 * @var IMountManager
	 */
	private IMountManager $mountManager;

	/**
	 * @var IUserSession
	 */
	private IUserSession $userSession;


	/**
	 * ChecksumController constructor.
	 *
	 * @param string $appName
	 * @param IRequest $request
	 * @param IFactory $languageFactory
	 * @param IMountManager $mountManager
	 * @param IUserSession $userSession
	 */
	public function __construct(
		string $appName,
		IRequest $request,
		IFactory $languageFactory,
		IMountManager $mountManager,
		IUserSession $userSession
	) {
		parent::__construct($appName, $request);

		$this->language = $languageFactory->get('checksum');
		$this->mountManager = $mountManager;
		$this->userSession = $userSession;
	}

	/**
	 * Compute the hash of a file.
	 *
	 * @NoAdminRequired
	 * @param string $source file path relative to user home
	 * @param string $type hash algorithm
	 * @return JSONResponse
	 */
	public function check(string $source, string $type): JSONResponse {
		if (!$this->checkAlgorithmType($type)) {
			return new JSONResponse(
				array(
					'response' => 'error',
					'msg' => $this->language->t(
						'The algorithm type "%s" is not a valid or supported algorithm type.',
						array($type)
					)
				)
			);
		}

		$hash = $this->getHash($source, $type);
		if ($hash) {
			return new JSONResponse(
				array(
					'response' => 'success',
					'msg' => $hash
				)
			);
		} else {
			return new JSONResponse(
				array(
					'response' => 'error',
					'msg' => $this->language->t('File not found.')
				)
			);
		}
	}

	private function getHash(string $source, string $type): ?string {
		$user = $this->userSession->getUser();
		if (!$user) {
			return null;
		}

		$absPath = $user->getUID() . '/files/' . $source;
		$mount = $this->mountManager->find($absPath);
		if (!$mount) {
			return null;
		}

		$internalPath = $mount->getInternalPath($absPath);
		$file = $mount->getStorage()->fopen($internalPath, 'rb');
		if (!$file) {
			return null;
		}

		$hash = hash_init($type);
		hash_update_stream($hash, $file);
		fclose($file);
		return hash_final($hash);
	}

	private function checkAlgorithmType(string $type): bool {
		return in_array($type, $this->getAllowedAlgorithmTypes()) && in_array($type, hash_algos());
	}

	private function getAllowedAlgorithmTypes(): array {
		return array(
			'md5',
			'sha1',
			'sha256',
			'sha384',
			'sha512',
			'crc32'
		);
	}
}
