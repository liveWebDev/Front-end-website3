import {Directive, HostListener} from "@angular/core";

@Directive({
    selector: "[stop-mousedown-propagation]"
})

export class StopMousedownPropagation
{
    @HostListener("mousedown", ["$event"])
    public onMouseDown(event: any): void
    {
        event.stopPropagation();
    }
}