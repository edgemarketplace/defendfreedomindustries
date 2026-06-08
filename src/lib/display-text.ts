const DISPLAY_TEXT_REPLACEMENTS: Array<[RegExp, string]> = [
    [/\bBenevolant\b/gi, 'Benevolent'],
];

export function cleanDisplayText(value: string): string {
    return DISPLAY_TEXT_REPLACEMENTS.reduce(
        (text, [pattern, replacement]) => text.replace(pattern, replacement),
        value
    );
}
