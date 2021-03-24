export class IntegerToWordHelper {

    ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
        "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety", "Hundred"];
    scale = ["", "Thousand", "Million", "Billion", "Trillion", "Quadrillion", "Quintillion", "Sextillion"];

    integerToWords(n: any): string {
        if (n === 0) return "Zero";                                   // check for zero
        n = ("0".repeat(2 * (n += "").length % 3) + n).match(/.{3}/g);   // create triplets array
        if (n.length > this.scale.length) return "Too Large";             // check if larger than scale array
        let out = "";
        n.forEach((triplet: any, pos: number) => {             // loop into array for each triplet
                if (triplet) {
                    out += ' ' + (+triplet[0] ? this.ones[+triplet[0]] + ' ' + this.tens[10] : "") +
                        ' ' + (+triplet.substr(1) < 20 ? this.ones[+triplet.substr(1)] :
                            this.tens[+triplet[1]] + (+triplet[2] ? "-" : "") + this.ones[+triplet[2]]) +
                        ' ' + this.scale[n.length - pos - 1];
                }
            }
        )
        return out.replace(/\s+/g, ' ')?.trim()?.toLowerCase();
    }
}
