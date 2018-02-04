import { DomSanitizer } from '@angular/platform-browser'
import {Pipe, PipeTransform} from "@angular/core";

@Pipe({ name: 'safeHtml'})
export class SafeHtmlPipe implements PipeTransform  {

    constructor(private sanitized: DomSanitizer) {}

    transform(value) {
        return this.sanitized.bypassSecurityTrustHtml(value.replace(/<style type="text\/css">/g, '<stylex style="display: none">').replace(/<\/style>/g, '</stylex>'));
    }
}