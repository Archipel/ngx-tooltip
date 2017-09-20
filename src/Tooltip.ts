import {
    Directive, HostListener, ComponentRef, ViewContainerRef, Input, ComponentFactoryResolver,
    ComponentFactory
} from '@angular/core';
import { TooltipContent } from './TooltipContent';

@Directive({
    selector: '[tooltip]'
})
export class Tooltip {

    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    private tooltip: ComponentRef<TooltipContent>;
    private visible: boolean;

    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(private viewContainerRef: ViewContainerRef) {
    }

    // -------------------------------------------------------------------------
    // Inputs / Outputs
    // -------------------------------------------------------------------------

    @Input('tooltip')
    content: string | TooltipContent;

    @Input()
    tooltipDisabled: boolean;

    @Input()
    tooltipAnimation: boolean = true;

    @Input()
    tooltipPlacement: 'top' | 'bottom' | 'left' | 'right' = 'bottom';

    @Input()
    visibility: { value: boolean, clickOutside?: boolean } = {value: false};
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    ngOnChanges(changes: any) {
        if (this.visibility.clickOutside) {
            (this.content as TooltipContent).mouseIn = false;
        }
        if (changes.tooltipPlacement) {
            (this.content as TooltipContent).placement = this.tooltipPlacement;
        }
        if (this.visibility.value) {
            (this.content as TooltipContent).visibility = true;
            this.show();
        }

        if (!this.visibility.value) {
            (this.content as TooltipContent).visibility = false;
            this.hide();
        }
    }

    show(): void {
        const tooltip = this.content as TooltipContent;

        if (this.tooltipDisabled || this.visible) {
            // to recalculate position
            tooltip.placement = this.tooltipPlacement;
            tooltip.preventAutoHide = true;
            tooltip.show();
            return;
        }
        this.visible = true;


        tooltip.hostElement = this.viewContainerRef.element.nativeElement;
        tooltip.placement = this.tooltipPlacement;
        tooltip.animation = this.tooltipAnimation;
        tooltip.show();
    }

    @HostListener('window:resize', ['$event'])
    hide(): void {
        (this.content as TooltipContent).hide();
        if ((this.content as TooltipContent).mouseIn) return;

        this.visible = false;
    }

}