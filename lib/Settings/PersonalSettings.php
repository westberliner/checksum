<?php

namespace OCA\Checksum\Settings;

use OCP\IConfig;
use OCP\Settings\ISettings;
use OCA\Checksum\AppInfo\Application;
use OCP\AppFramework\Http\TemplateResponse;

class PersonalSettings implements ISettings {

	/**
	 * @var IConfig
	 */
	private $config;
	
	public function __construct(IConfig $config) {
		$this->config = $config;
	}

	public function getForm(): TemplateResponse {
		return new TemplateResponse(
			Application::APP_ID,
			'AdminSettings',
			$this->getSettings()
		);
	}

	public function getSection(): string {
		return Application::APP_ID;
	}

	public function getPriority(): int {
		return 50;
	}

	private function getSettings(): array {
		return [
			'allowPersonalSettings' => $this->config->getAppValue(Application::APP_ID, 'allowPersonalSettings')
		];
	}
}
