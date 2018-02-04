import { Directive, ElementRef, Renderer, Input } from '@angular/core';
@Directive({
    selector : '[listFocus]'
})
export class ListFocus {
    constructor(public renderer: Renderer, public elementRef: ElementRef) {}

    @Input()
    set listFocus(value :boolean) {
        if(value) {
            this.renderer.setElementClass(this.elementRef.nativeElement, "focus", true || false)
        }
    }
}