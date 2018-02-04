/**
 * Created by adrian on 6/19/17.
 */
export class CompanyContactField {
    name: string;
    value: string;
    id: number;

    constructor(data) {
        if (typeof data === "string") {
            this.id = 0;
            this.name = data;
            this.value = "";
        } else if (typeof data === "object") {
            this.id = data["id"];
            this.name = data["name"];
            this.value = data["value"];
        }
    }
}