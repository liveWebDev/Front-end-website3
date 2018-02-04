/**
 * Created by adrian on 5/14/17.
 */
import {Component, ViewEncapsulation} from '@angular/core';
import {ChangelogService} from "../_services/changelog.service";

@Component({
    templateUrl: './instructions.component.html',
    styleUrls: ['../index.scss', '../vendor.scss', './about.scss'],
    encapsulation: ViewEncapsulation.Emulated,
})

export class InstructionsComponent {
    constructor() {}
}
