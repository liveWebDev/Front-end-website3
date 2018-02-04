import {Injectable, Inject} from '@angular/core';
import { CanDeactivate } from '@angular/router';
import {InboxComponent} from "../inbox/inbox.component";

@Injectable()
export class ConfirmDeactivateGuard implements CanDeactivate<InboxComponent> {

    canDeactivate(target: InboxComponent) {
        if (target.hasChanges()) {
            return window.confirm('Do you really want to discard your changes? You may lose data');
        }
        return true;
    }

}