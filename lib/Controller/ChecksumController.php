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
		 * @param (string) $dir - folder to file
		 */
	  public function check($source) {

				if($md5 = $this->getHash($source)){
						return new JSONResponse(
								array(
										'response' => 'success',
										'msg' => $md5
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

	  protected function getHash($source) {

	  	if($info = Filesystem::getLocalFile($source)) {
	  			return md5_file($info);
	  	}

	  	return false;
	  }

}

