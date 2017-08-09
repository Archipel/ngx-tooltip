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

    ngOnChanges() {
        console.log('visibility', this.visibility);
        if (this.visibility) {
            setTimeout(() => this.show(), 0);
        } else {
            setTimeout(() => this.hide(), 0);
        }
    }

    show(): void {
        console.log('tooltip show');

        if (this.tooltipDisabled || this.visible) {
            return;
        }
        this.visible = true;
        if (typeof this.content === 'string') {
            const factory = this.resolver.resolveComponentFactory(TooltipContent);
            if (!this.visible)
                return;

            this.tooltip = this.viewContainerRef.createComponent(factory);
            this.tooltip.instance.hostElement = this.viewContainerRef.element.nativeElement;
            this.tooltip.instance.content = this.content as string;
            this.tooltip.instance.placement = this.tooltipPlacement;
            this.tooltip.instance.animation = this.tooltipAnimation;
        } else {
            const tooltip = this.content as TooltipContent;
            tooltip.hostElement = this.viewContainerRef.element.nativeElement;
            tooltip.placement = this.tooltipPlacement;
            tooltip.animation = this.tooltipAnimation;
            tooltip.show();
        }
    }

    hide(): void {
        if (!this.visible)
            return;

        this.visible = false;
        if (this.tooltip)
            this.tooltip.destroy();

        if (this.content instanceof TooltipContent)
            (this.content as TooltipContent).hide();
    }

}