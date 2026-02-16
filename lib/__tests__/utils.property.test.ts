/**
 * Property-based tests for utility functions.
 * Feature: canvas-sharing-modal
 *
 * Uses fast-check to validate correctness properties from the design document.
 */
import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { isValidEmail, getInitials } from "../utils";

// --- Property 2: Email validation ---
// Feature: canvas-sharing-modal, Property 2: Email validation
// Validates: Requirements 2.2
describe("Property 2: Email validation", () => {
  it("for any string with @ symbol, local part, domain, and extension, isValidEmail returns true", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter((s) => !s.includes("@") && !s.includes(" ")),
        fc.string({ minLength: 1, maxLength: 20 }).filter((s) => !s.includes("@") && !s.includes(" ") && !s.includes(".")),
        fc.string({ minLength: 1, maxLength: 10 }).filter((s) => !s.includes("@") && !s.includes(" ") && !s.includes(".")),
        (localPart, domain, extension) => {
          const email = `${localPart}@${domain}.${extension}`;
          const result = isValidEmail(email);
          
          // Should return true for properly formatted email
          expect(result).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("for any string without @ symbol, isValidEmail returns false", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 50 }).filter((s) => !s.includes("@")),
        (invalidEmail) => {
          const result = isValidEmail(invalidEmail);
          
          // Should return false for email without @
          expect(result).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("for any string with @ but no domain extension, isValidEmail returns false", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter((s) => !s.includes("@") && !s.includes(" ") && !s.includes(".")),
        fc.string({ minLength: 1, maxLength: 20 }).filter((s) => !s.includes("@") && !s.includes(" ") && !s.includes(".")),
        (localPart, domain) => {
          const invalidEmail = `${localPart}@${domain}`;
          const result = isValidEmail(invalidEmail);
          
          // Should return false for email without domain extension
          expect(result).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("for any string with whitespace, isValidEmail returns false", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (localPart, domain, extension) => {
          // Add whitespace somewhere in the email
          const emailWithSpace = `${localPart} @${domain}.${extension}`;
          const result = isValidEmail(emailWithSpace);
          
          // Should return false for email with whitespace
          expect(result).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("for empty string, isValidEmail returns false", () => {
    const result = isValidEmail("");
    expect(result).toBe(false);
  });
});

// --- Property 8: Avatar fallback ---
// Feature: canvas-sharing-modal, Property 8: Avatar fallback
// Validates: Requirements 3.4
describe("Property 8: Avatar fallback", () => {
  it("for any name with single word, getInitials returns first letter uppercase", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter((s) => !s.includes(" ") && s.trim().length > 0),
        (name) => {
          const initials = getInitials(name);
          
          // Should return first letter uppercase
          expect(initials).toBe(name[0].toUpperCase());
          expect(initials.length).toBe(1);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("for any name with two words, getInitials returns first letter of each word uppercase", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter((s) => {
          const trimmed = s.trim();
          return trimmed.length > 0 && /^[a-zA-Z]+$/.test(trimmed);
        }),
        fc.string({ minLength: 1, maxLength: 20 }).filter((s) => {
          const trimmed = s.trim();
          return trimmed.length > 0 && /^[a-zA-Z]+$/.test(trimmed);
        }),
        (firstName, lastName) => {
          const name = `${firstName.trim()} ${lastName.trim()}`;
          const initials = getInitials(name);
          
          // Should return first letter of each word uppercase, max 2 characters
          expect(initials).toBe(`${firstName.trim()[0]}${lastName.trim()[0]}`.toUpperCase());
          expect(initials.length).toBe(2);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("for any name with more than two words, getInitials returns first two initials", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 20 }).filter((s) => {
          const trimmed = s.trim();
          return trimmed.length > 0 && /^[a-zA-Z]+$/.test(trimmed);
        }),
        fc.string({ minLength: 1, maxLength: 20 }).filter((s) => {
          const trimmed = s.trim();
          return trimmed.length > 0 && /^[a-zA-Z]+$/.test(trimmed);
        }),
        fc.string({ minLength: 1, maxLength: 20 }).filter((s) => {
          const trimmed = s.trim();
          return trimmed.length > 0 && /^[a-zA-Z]+$/.test(trimmed);
        }),
        (first, middle, last) => {
          const name = `${first.trim()} ${middle.trim()} ${last.trim()}`;
          const initials = getInitials(name);
          
          // Should return only first 2 initials
          expect(initials.length).toBeLessThanOrEqual(2);
          expect(initials).toBe(`${first.trim()[0]}${middle.trim()[0]}`.toUpperCase());
        },
      ),
      { numRuns: 100 },
    );
  });

  it("for any name, getInitials returns uppercase characters only", () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
        (nameParts) => {
          const name = nameParts.join(" ");
          const initials = getInitials(name);
          
          // Should return uppercase characters
          expect(initials).toBe(initials.toUpperCase());
          // Should be at most 2 characters
          expect(initials.length).toBeLessThanOrEqual(2);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("for any name, getInitials returns at most 2 characters", () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 10 }),
        (nameParts) => {
          const name = nameParts.join(" ");
          const initials = getInitials(name);
          
          // Should return at most 2 characters
          expect(initials.length).toBeLessThanOrEqual(2);
          expect(initials.length).toBeGreaterThan(0);
        },
      ),
      { numRuns: 100 },
    );
  });
});
