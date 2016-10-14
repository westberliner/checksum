<?php
	namespace OCA\Checksum\Controller;
	use OCP\IRequest;
	use OCP\AppFramework\Http\JSONResponse;
	use OCP\AppFramework\ApiController;

	class ChecksumController extends ApiController {

		public function __construct($AppName, IRequest $request){
        		parent::__construct($AppName, $request);
		}
		/**
		 * @NoAdminRequired      
		 */
		public function calculate($source, $dir) {
			$file = $dir.$source;
			
			if($info = \OC\Files\Filesystem::getLocalFile($file)){
				$md5 = md5_file($info);
				
				return new JSONResponse(array("checksum" => $md5));
			} else {
				return new JSONResponse(array("error" => "File not found."));  
			};
		}
	}
?>
