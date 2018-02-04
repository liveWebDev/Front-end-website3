/**
 * Created by adrian on 5/14/17.
 */
import {Component, ViewEncapsulation, Input} from '@angular/core';

@Component({
    template: '<div [innerHtml]="htmlString | safeHtml" (copy)="copyTextWrapper($event);"></div>',
    encapsulation: ViewEncapsulation.Emulated,
    selector: 'email-html-view'
})

export class EmailHtmlViewComponent {
    @Input() htmlString:string;

    constructor() {};

    copyTextWrapper($event) {
        $event.preventDefault();

        let copytext =  window.getSelection();

        if (copytext) {
            copytext = this.processNodeTree($event.target, copytext);

            if ($event.clipboardData) {

                $event.clipboardData.setData('Text', copytext);
            }
        }
    }

    processNodeTree(node, text) {
        console.log(node.nodeName);

        if (!node || node.nodeName === "EMAIL-HTML-VIEW") {
            return text;
        }

        if (node.nodeName === "BLOCKQUOTE") {
            return this.processNodeTree(node.parentNode, this.wrapTextIntoQuotes(text));
        } else {
            return this.processNodeTree(node.parentNode, text);
        }
    }

    wrapTextIntoQuotes(text) {
        return '<blockquote>' + text + '</blockquote>';
    }
}
