<?php
namespace OCA\Checksum\Controller;

use OCP\AppFramework\Controller;
use OCP\IRequest;
use OC\Files\Filesystem;
use OCP\AppFramework\Http\JSONResponse;


class ChecksumController extends Controller {

		protected $language;

		public function __construct($appName, IRequest $request) {

				parent::__construct($appName, $request);

				// get i10n
				$this->language = \OC::$server->getL10N('checksum');

		}

		/**
		 * callback function to get md5 hash of a file
		 * @param (string) $source - filename
		 * @param (string) $type - hash algorithm type
		 */
	  public function check($source, $type) {

	  		if(!$this->checkAlgorithmType($type)) {
	  			return new JSONResponse(
							array(
									'response' => 'error',
									'msg' => $this->language->t('This is not a valid algorithm type.')
							)
					);
	  		}

				if($hash = $this->getHash($source, $type)){
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
				};

	  }

	  protected function getHash($source, $type) {

	  	if($info = Filesystem::getLocalFile($source)) {
	  			return hash_file($type, $info);
	  	}

	  	return false;
	  }

	  protected function checkAlgorithmType($type) {
	  	return in_array($type, $this->getAllowedAlgorithmTypes());
	  }

	  protected function getAllowedAlgorithmTypes() {
	  	return array(
				'md5',
				'sha1',
				'sha256',
				'sha512',
				'crc32'
			);
		}
}

