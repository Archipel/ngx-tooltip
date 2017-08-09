import {
    Directive, HostListener, ComponentRef, ViewContainerRef, Input, ComponentFactoryResolver,
    ComponentFactory
} from '@angular/core';
import { TooltipContent } from './TooltipContent';
import { Debounce } from './Debounce.decorator';

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

    constructor(private viewContainerRef: ViewContainerRef,
                private resolver: ComponentFactoryResolver) {
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
    visibility: boolean;
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    @Debounce(300)
    ngOnChanges() {
        console.log('visibility', this.visibility);
        if (this.visibility) {
            this.show();
        } else {
            this.hide();
        }
    }

    show(): void {
        console.log('tooltip show');

        if (this.tooltipDisabled || this.visible) {
            (this.content as TooltipContent).show(); // to recalculate position
            return;
        }
        this.visible = true;

        const tooltip = this.content as TooltipContent;
        tooltip.hostElement = this.viewContainerRef.element.nativeElement;
        tooltip.placement = this.tooltipPlacement;
        tooltip.animation = this.tooltipAnimation;
        tooltip.show();
    }

    hide(): void {
        console.log('tooltip hide');
        if (!this.visible)
            return;

        this.visible = false;
        if (this.tooltip)
            this.tooltip.destroy();

        if (this.content instanceof TooltipContent)
            (this.content as TooltipContent).hide();
    }

}