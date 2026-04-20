<?php

declare(strict_types=1);

namespace OCA\Checksum\Tests\Unit\Controller;

use OCA\Checksum\Controller\ChecksumController;
use OCA\Checksum\Service\ChecksumService;
use OCP\AppFramework\Http\JSONResponse;
use OCP\Files\NotPermittedException;
use OCP\IL10N;
use OCP\IRequest;
use OCP\L10N\IFactory;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class ChecksumControllerTest extends TestCase {
	private ChecksumController $controller;
	/** @var IRequest|MockObject */
	private $request;
	/** @var IFactory|MockObject */
	private $languageFactory;
	/** @var IL10N|MockObject */
	private $l10n;
	/** @var ChecksumService|MockObject */
	private $checksumService;

	protected function setUp(): void {
		parent::setUp();

		$this->request = $this->createMock(IRequest::class);
		$this->languageFactory = $this->createMock(IFactory::class);
		$this->l10n = $this->createMock(IL10N::class);
		$this->checksumService = $this->createMock(ChecksumService::class);

		$this->languageFactory
			->method('get')
			->willReturn($this->l10n);

		$this->l10n
			->method('t')
			->willReturnCallback(function ($text, $params = []) {
				return vsprintf($text, $params);
			});

		$this->controller = new ChecksumController(
			'checksum',
			$this->request,
			$this->languageFactory,
			$this->checksumService,
		);
	}

	public function testCheckWithInvalidAlgorithm(): void {
		$this->checksumService->method('isValidAlgorithm')->willReturn(false);

		$response = $this->controller->check('/test.txt', 'invalid_algo');

		$this->assertInstanceOf(JSONResponse::class, $response);
		$data = $response->getData();
		$this->assertEquals('error', $data['response']);
		$this->assertStringContainsString('not a valid', $data['msg']);
	}

	public function testCheckWithNegativeStartByte(): void {
		$this->checksumService->method('isValidAlgorithm')->willReturn(true);

		$response = $this->controller->check('/test.txt', 'md5', -1);

		$this->assertInstanceOf(JSONResponse::class, $response);
		$data = $response->getData();
		$this->assertEquals('error', $data['response']);
		$this->assertStringContainsString('Start byte', $data['msg']);
	}

	public function testCheckWithNegativeEndByte(): void {
		$this->checksumService->method('isValidAlgorithm')->willReturn(true);

		$response = $this->controller->check('/test.txt', 'md5', 0, -1);

		$this->assertInstanceOf(JSONResponse::class, $response);
		$data = $response->getData();
		$this->assertEquals('error', $data['response']);
		$this->assertStringContainsString('End byte', $data['msg']);
	}

	public function testCheckWithInvalidByteRange(): void {
		$this->checksumService->method('isValidAlgorithm')->willReturn(true);

		$response = $this->controller->check('/test.txt', 'md5', 100, 50);

		$this->assertInstanceOf(JSONResponse::class, $response);
		$data = $response->getData();
		$this->assertEquals('error', $data['response']);
		$this->assertStringContainsString('Start byte must be less than', $data['msg']);
	}

	public function testCheckWithNoUser(): void {
		$this->checksumService->method('isValidAlgorithm')->willReturn(true);
		$this->checksumService->method('computeHash')->willThrowException(new NotPermittedException('No authenticated user'));

		$response = $this->controller->check('/test.txt', 'md5');

		$this->assertInstanceOf(JSONResponse::class, $response);
		$data = $response->getData();
		$this->assertEquals('error', $data['response']);
		$this->assertStringContainsString('File not found', $data['msg']);
	}

	public function testCheckSuccessfulMd5(): void {
		$testContent = 'Hello, World!';
		$expectedMd5 = md5($testContent);

		$this->checksumService->method('isValidAlgorithm')->willReturn(true);
		$this->checksumService->method('computeHash')->willReturn($expectedMd5);

		$response = $this->controller->check('/test.txt', 'md5');

		$this->assertInstanceOf(JSONResponse::class, $response);
		$data = $response->getData();
		$this->assertEquals('success', $data['response']);
		$this->assertEquals($expectedMd5, $data['msg']);
	}

	public function testCheckSuccessfulSha256(): void {
		$testContent = 'Test content for SHA-256';
		$expectedHash = hash('sha256', $testContent);

		$this->checksumService->method('isValidAlgorithm')->willReturn(true);
		$this->checksumService->method('computeHash')->willReturn($expectedHash);

		$response = $this->controller->check('/test.txt', 'sha256');

		$this->assertInstanceOf(JSONResponse::class, $response);
		$data = $response->getData();
		$this->assertEquals('success', $data['response']);
		$this->assertEquals($expectedHash, $data['msg']);
	}

	public function testCheckWithByteRange(): void {
		$testContent = '0123456789ABCDEF';
		$rangeStart = 5;
		$rangeEnd = 10;
		$expectedHash = hash('md5', substr($testContent, $rangeStart, $rangeEnd - $rangeStart));

		$this->checksumService->method('isValidAlgorithm')->willReturn(true);
		$this->checksumService->method('computeHash')->willReturn($expectedHash);

		$response = $this->controller->check('/test.txt', 'md5', $rangeStart, $rangeEnd);

		$this->assertInstanceOf(JSONResponse::class, $response);
		$data = $response->getData();
		$this->assertEquals('success', $data['response']);
		$this->assertEquals($expectedHash, $data['msg']);
	}
}
