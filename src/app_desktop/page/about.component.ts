/**
 * Created by adrian on 5/14/17.
 */
import {Component, ViewEncapsulation} from '@angular/core';
import {ChangelogService} from "../_services/changelog.service";

@Component({
    templateUrl: './about.component.html',
    styleUrls: ['../index.scss', '../vendor.scss', './about.scss'],
    encapsulation: ViewEncapsulation.Emulated,
})

export class AboutComponent {
    changelogItems: ChangelogItem[];

    constructor(private changelogService: ChangelogService) {

        this.changelogService.getReleaseNotes().subscribe(data => {
            this.changelogItems = data;
        });
    }

}

interface ChangelogItem {
    title: string,
    body: string,
}
