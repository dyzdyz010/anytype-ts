import { describe, it, expect } from 'vitest';
import * as I from 'Interface';
import UtilTemplate from './template';
import UtilDate from './date';

describe('UtilTemplate', () => {

	// Fixed reference: 2026-06-03 12:00:00, ISO date format (Y-m-d) for stable assertions.
	const now = UtilDate.timestamp(2026, 6, 3, 12, 0, 0);
	const ctx = { now, dateFormat: I.DateFormat.ISO };

	describe('resolve', () => {

		it('should replace {{today}} with the current date in the user format', () => {
			expect(UtilTemplate.resolve('{{today}}', ctx)).toBe('2026-06-03');
		});

		it('should replace {{tomorrow}} with the next day', () => {
			expect(UtilTemplate.resolve('{{tomorrow}}', ctx)).toBe('2026-06-04');
		});

		it('should replace {{yesterday}} with the previous day', () => {
			expect(UtilTemplate.resolve('{{yesterday}}', ctx)).toBe('2026-06-02');
		});

		it('should replace {{year}}, {{month}}, {{day}} with numeric parts', () => {
			expect(UtilTemplate.resolve('{{year}}', ctx)).toBe('2026');
			expect(UtilTemplate.resolve('{{month}}', ctx)).toBe('6');
			expect(UtilTemplate.resolve('{{day}}', ctx)).toBe('3');
		});

		it('should replace {{week}} with the ISO week number', () => {
			const out = UtilTemplate.resolve('{{week}}', ctx);

			expect(out).toMatch(/^\d{1,2}$/);
			expect(Number(out)).toBeGreaterThanOrEqual(1);
			expect(Number(out)).toBeLessThanOrEqual(53);
		});

		it('should replace multiple placeholders in one string', () => {
			expect(UtilTemplate.resolve('Weekly {{today}} ({{year}})', ctx)).toBe('Weekly 2026-06-03 (2026)');
		});

		it('should be case-insensitive and tolerate inner whitespace', () => {
			expect(UtilTemplate.resolve('{{ Today }}', ctx)).toBe('2026-06-03');
			expect(UtilTemplate.resolve('{{TODAY}}', ctx)).toBe('2026-06-03');
		});

		it('should keep unknown placeholders untouched', () => {
			expect(UtilTemplate.resolve('{{foobar}}', ctx)).toBe('{{foobar}}');
			expect(UtilTemplate.resolve('hi {{foobar}} {{today}}', ctx)).toBe('hi {{foobar}} 2026-06-03');
		});

		it('should return text without placeholders unchanged', () => {
			expect(UtilTemplate.resolve('plain title', ctx)).toBe('plain title');
			expect(UtilTemplate.resolve('', ctx)).toBe('');
		});

	});

	describe('has', () => {

		it('should detect placeholders', () => {
			expect(UtilTemplate.has('a {{today}} b')).toBe(true);
			expect(UtilTemplate.has('{{ x }}')).toBe(true);
		});

		it('should return false when there are none', () => {
			expect(UtilTemplate.has('no placeholder')).toBe(false);
			expect(UtilTemplate.has('')).toBe(false);
			expect(UtilTemplate.has('{ single }')).toBe(false);
		});

	});

});
