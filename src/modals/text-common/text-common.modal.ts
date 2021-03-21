export interface TextCommonModal {
    showCharCount?: boolean,
    showWordCount?: boolean,
    mask?: boolean,
    inputMask?: string|string[],
    input?: boolean,
    autoComplete?: "on"|"off",
    case?: "uppercase"|"mixed"|"lowercase"
}
