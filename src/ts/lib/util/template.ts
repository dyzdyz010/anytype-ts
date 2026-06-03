import * as I from 'Interface';
import UtilDate from './date';

/**
 * Evaluation context for resolving template placeholders. Passed in by the
 * caller (current timestamp + user date format) so this utility stays pure
 * and testable, with no store or clock dependency of its own.
 */
interface TemplateContext {
	now: number;
	dateFormat: I.DateFormat;
};

/**
 * Resolves `{{placeholder}}` tokens used in template object titles into real
 * values (e.g. `{{today}}` -> the current date) when a new object is created
 * from a template. Unknown placeholders are left untouched.
 */
class UtilTemplate {

	/**
	 * Returns true if the text contains at least one `{{placeholder}}`.
	 * Uses a local non-global regexp to avoid shared lastIndex state.
	 */
	has (text: string): boolean {
		return /\{\{\s*[A-Za-z0-9_]+\s*\}\}/.test(String(text || ''));
	};

	/**
	 * Replaces every `{{placeholder}}` in text with its resolved value.
	 * Placeholder names are case-insensitive and may contain inner whitespace.
	 * Unknown placeholders are returned verbatim so user text is never lost.
	 */
	resolve (text: string, ctx: TemplateContext): string {
		const t = String(text || '');
		if (!t) {
			return t;
		};

		return t.replace(/\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g, (match: string, name: string) => {
			const value = this.value(String(name).toLowerCase(), ctx);
			return value === null ? match : value;
		});
	};

	/**
	 * Resolves a single placeholder name to its value, or null if unknown.
	 */
	private value (name: string, ctx: TemplateContext): string | null {
		const { now, dateFormat } = ctx;
		const { d, m, y } = UtilDate.getCalendarDateParam(now);

		switch (name) {
			case 'today':		return UtilDate.dateWithFormat(dateFormat, now);
			case 'tomorrow':	return UtilDate.dateWithFormat(dateFormat, UtilDate.timestamp(y, m, d + 1));
			case 'yesterday':	return UtilDate.dateWithFormat(dateFormat, UtilDate.timestamp(y, m, d - 1));
			case 'year':		return UtilDate.date('Y', now);
			case 'month':		return UtilDate.date('n', now);
			case 'day':			return UtilDate.date('j', now);
			case 'week':		return String(this.isoWeek(now));
		};

		return null;
	};

	/**
	 * ISO-8601 week number for the date of the given Unix timestamp.
	 */
	private isoWeek (timestamp: number): number {
		const src = new Date(timestamp * 1000);
		const d = new Date(Date.UTC(src.getFullYear(), src.getMonth(), src.getDate()));
		const dayNum = d.getUTCDay() || 7;

		d.setUTCDate(d.getUTCDate() + 4 - dayNum);

		const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
		return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
	};

};

export default new UtilTemplate();
