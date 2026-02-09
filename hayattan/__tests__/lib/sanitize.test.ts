import { sanitizeHtml } from '../../src/lib/sanitize';

describe('sanitizeHtml', () => {
    it('should allow clean HTML', () => {
        const clean = '<p>Hello World</p>';
        expect(sanitizeHtml(clean)).toBe(clean);
    });

    it('should remove script tags', () => {
        const dirty = '<p>Hello</p><script>alert("xss")</script>';
        const clean = sanitizeHtml(dirty);
        expect(clean).toBe('<p>Hello</p>');
    });

    it('should remove iframe tags', () => {
        const dirty = '<div><iframe src="http://evil.com"></iframe></div>';
        const clean = sanitizeHtml(dirty);
        expect(clean).toBe('<div></div>');
    });

    it('should remove onclick attributes', () => {
        const dirty = '<div onclick="alert(\'xss\')">Click me</div>';
        const clean = sanitizeHtml(dirty);
        expect(clean).toBe('<div>Click me</div>');
    });

    it('should allow simple formatting tags', () => {
        const dirty = '<b>Bold</b> <i>Italic</i> <u>Underline</u>';
        const clean = sanitizeHtml(dirty);
        expect(clean).toBe(dirty);
    });
});
