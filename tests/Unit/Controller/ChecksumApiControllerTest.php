<?php

declare(strict_types=1);

namespace OCA\Checksum\Tests\Unit\Controller;

use OCA\Checksum\Controller\ChecksumApiController;
use OCA\Checksum\Service\ChecksumService;
use OCP\AppFramework\Http;
use OCP\AppFramework\Http\DataResponse;
use OCP\Files\NotFoundException;
use OCP\Files\NotPermittedException;
use OCP\IL10N;
use OCP\IRequest;
use OCP\L10N\IFactory;
use PHPUnit\Framework\MockObject\MockObject;
use PHPUnit\Framework\TestCase;

class ChecksumApiControllerTest extends TestCase {
	private ChecksumApiController $controller;
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

		$this->controller = new ChecksumApiController(
			'checksum',
			$this->request,
			$this->languageFactory,
			$this->checksumService,
		);
	}

	public function testComputeWithInvalidAlgorithm(): void {
		$this->checksumService->method('isValidAlgorithm')->willReturn(false);

		$response = $this->controller->compute('/test.txt', 'invalid_algo');

		$this->assertInstanceOf(DataResponse::class, $response);
		$this->assertSame(Http::STATUS_BAD_REQUEST, $response->getStatus());
		$data = $response->getData();
		$this->assertArrayHasKey('error', $data);
		$this->assertStringContainsString('invalid_algo', $data['error']);
		$this->assertStringContainsString('not a valid', $data['error']);
	}

	public function testComputeWithNegativeStartByte(): void {
		$this->checksumService->method('isValidAlgorithm')->willReturn(true);

		$response = $this->controller->compute('/test.txt', 'md5', -1);

		$this->assertInstanceOf(DataResponse::class, $response);
		$this->assertSame(Http::STATUS_BAD_REQUEST, $response->getStatus());
		$data = $response->getData();
		$this->assertArrayHasKey('error', $data);
		$this->assertStringContainsString('Start byte', $data['error']);
	}

	public function testComputeWithNegativeEndByte(): void {
		$this->checksumService->method('isValidAlgorithm')->willReturn(true);

		$response = $this->controller->compute('/test.txt', 'md5', 0, -1);

		$this->assertInstanceOf(DataResponse::class, $response);
		$this->assertSame(Http::STATUS_BAD_REQUEST, $response->getStatus());
		$data = $response->getData();
		$this->assertArrayHasKey('error', $data);
		$this->assertStringContainsString('End byte', $data['error']);
	}

	public function testComputeWithStartByteEqualToEndByte(): void {
		$this->checksumService->method('isValidAlgorithm')->willReturn(true);

		$response = $this->controller->compute('/test.txt', 'md5', 100, 100);

		$this->assertInstanceOf(DataResponse::class, $response);
		$this->assertSame(Http::STATUS_BAD_REQUEST, $response->getStatus());
		$data = $response->getData();
		$this->assertArrayHasKey('error', $data);
		$this->assertStringContainsString('Start byte must be less than', $data['error']);
	}

	public function testComputeWithStartByteGreaterThanEndByte(): void {
		$this->checksumService->method('isValidAlgorithm')->willReturn(true);

		$response = $this->controller->compute('/test.txt', 'md5', 100, 50);

		$this->assertInstanceOf(DataResponse::class, $response);
		$this->assertSame(Http::STATUS_BAD_REQUEST, $response->getStatus());
		$data = $response->getData();
		$this->assertArrayHasKey('error', $data);
		$this->assertStringContainsString('Start byte must be less than', $data['error']);
	}

	public function testComputeFileNotFound(): void {
		$this->checksumService->method('isValidAlgorithm')->willReturn(true);
		$this->checksumService->method('computeHash')
			->willThrowException(new NotFoundException('File not found'));

		$response = $this->controller->compute('/missing.txt', 'md5');

		$this->assertInstanceOf(DataResponse::class, $response);
		$this->assertSame(Http::STATUS_NOT_FOUND, $response->getStatus());
		$data = $response->getData();
		$this->assertArrayHasKey('error', $data);
		$this->assertStringContainsString('File not found', $data['error']);
	}

	public function testComputeNotPermitted(): void {
		$this->checksumService->method('isValidAlgorithm')->willReturn(true);
		$this->checksumService->method('computeHash')
			->willThrowException(new NotPermittedException('No authenticated user'));

		$response = $this->controller->compute('/test.txt', 'md5');

		$this->assertInstanceOf(DataResponse::class, $response);
		$this->assertSame(Http::STATUS_NOT_FOUND, $response->getStatus());
		$data = $response->getData();
		$this->assertArrayHasKey('error', $data);
		$this->assertStringContainsString('File not found', $data['error']);
	}

	public function testComputeSuccessReturnsChecksumAlgorithmAndPath(): void {
		$expectedHash = md5('Hello, World!');

		$this->checksumService->method('isValidAlgorithm')->willReturn(true);
		$this->checksumService->method('computeHash')->willReturn($expectedHash);

		$response = $this->controller->compute('/test.txt', 'md5');

		$this->assertInstanceOf(DataResponse::class, $response);
		$this->assertSame(Http::STATUS_OK, $response->getStatus());
		$data = $response->getData();
		$this->assertSame($expectedHash, $data['checksum']);
		$this->assertSame('md5', $data['algorithm']);
		$this->assertSame('/test.txt', $data['path']);
	}

	public function testComputeSuccessWithSha256(): void {
		$expectedHash = hash('sha256', 'Test content');

		$this->checksumService->method('isValidAlgorithm')->willReturn(true);
		$this->checksumService->method('computeHash')->willReturn($expectedHash);

		$response = $this->controller->compute('/docs/file.pdf', 'sha256');

		$this->assertInstanceOf(DataResponse::class, $response);
		$this->assertSame(Http::STATUS_OK, $response->getStatus());
		$data = $response->getData();
		$this->assertSame($expectedHash, $data['checksum']);
		$this->assertSame('sha256', $data['algorithm']);
		$this->assertSame('/docs/file.pdf', $data['path']);
	}

	public function testComputeWithByteRangePassesParamsToService(): void {
		$expectedHash = hash('sha1', 'partial');

		$this->checksumService->method('isValidAlgorithm')->willReturn(true);
		$this->checksumService
			->expects($this->once())
			->method('computeHash')
			->with('/test.txt', 'sha1', 100, 200)
			->willReturn($expectedHash);

		$response = $this->controller->compute('/test.txt', 'sha1', 100, 200);

		$this->assertInstanceOf(DataResponse::class, $response);
		$this->assertSame(Http::STATUS_OK, $response->getStatus());
		$data = $response->getData();
		$this->assertSame($expectedHash, $data['checksum']);
	}

	public function testComputeWithoutByteRangePassesNullsToService(): void {
		$expectedHash = hash('md5', 'content');

		$this->checksumService->method('isValidAlgorithm')->willReturn(true);
		$this->checksumService
			->expects($this->once())
			->method('computeHash')
			->with('/path/to/file.txt', 'md5', null, null)
			->willReturn($expectedHash);

		$this->controller->compute('/path/to/file.txt', 'md5');
	}
}
