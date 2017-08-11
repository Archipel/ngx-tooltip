import {
    Component, Input, AfterViewInit, ElementRef, ChangeDetectorRef, OnChanges, OnInit,
    OnDestroy
} from '@angular/core';
import { Debounce } from './Debounce.decorator';
import * as _ from 'lodash';

@Component({
    selector: 'tooltip-content',
    template: `
        <div class="tooltip {{ placement }}"
             [style.top]="top + 'px'"
             [style.left]="left + 'px'"
             [class.in]="isIn"
             [class.fade]="isFade"
             role="tooltip">
            <div class="tooltip-arrow"></div>
            <div class="tooltip-inner">
                <ng-content></ng-content>
                {{ content }}
            </div>
        </div>
    `
})
export class TooltipContent implements AfterViewInit, OnChanges, OnInit, OnDestroy {

    // -------------------------------------------------------------------------
    // Inputs / Outputs 
    // -------------------------------------------------------------------------

    @Input()
    hostElement: HTMLElement;

    @Input()
    content: string;

    @Input()
    placement: 'top' | 'bottom' | 'left' | 'right' = 'bottom';

    @Input()
    animation: boolean = true;

    @Input()
    changeSize: any; // detecting changes on size of tooltip window

    @Input()
    hideTimeoutMs: number = 150;
    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    top: number = -100000;
    left: number = -100000;
    isIn: boolean = false;
    isFade: boolean = false;

    mouseIn: boolean = false;
    sizeWasChanged: boolean = false;

    preventAutoHide: boolean = false;

    onMouseEnter: Function;
    onMouseLeave: Function;
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------

    constructor(private element: ElementRef,
                private cdr: ChangeDetectorRef) {
    }

    // -------------------------------------------------------------------------
    // Lifecycle callbacks
    // -------------------------------------------------------------------------

    ngOnInit() {
        this.onMouseEnter = () => {
            this.preventAutoHide = false;
            this.mouseIn = true;
        };

        const debouncedHide: Function = _.debounce(() => {
            if (this.preventAutoHide) {
                this.preventAutoHide = false;
                return;
            }
            this.hide();
        }, this.hideTimeoutMs);


        this.onMouseLeave = (e: any) => {
            if (e.buttons === 2) return; // prevent mouseRightClick to make run mouseleave handler
            this.mouseIn = false;
            if (this.sizeWasChanged) return;

            debouncedHide();
        };
    }

    @Debounce(0)
    ngOnChanges() {
        if (!this.sizeWasChanged && this.changeSize === true) {
            this.sizeWasChanged = true;
        }

        this.show();
    }

    ngAfterViewInit(): void {
        this.show();
        this.cdr.detectChanges();

        this.element.nativeElement
            .addEventListener('mouseenter', this.onMouseEnter);

        this.element.nativeElement
            .addEventListener('mouseleave', this.onMouseLeave);

    }

    ngOnDestroy() {
        this.element.nativeElement
            .removeEventListener('mouseenter', this.onMouseEnter);

        this.element.nativeElement
            .removeEventListener('mouseleave', this.onMouseLeave);
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------

    show(): void {
        if (!this.hostElement)
            return;
        const p = this.positionElements(this.hostElement, this.element.nativeElement.children[0], this.placement);

        let tooltip = this.element.nativeElement.children[0];
        let parent = this.hostElement.offsetParent;

        this.top = p.top;
        let topCorrection = (this.top + tooltip.clientHeight) - this.hostElement.offsetTop;
        topCorrection = (this.placement === 'top') ? topCorrection : 0;
        this.top = this.top + topCorrection;

        let leftLimit = parent.clientWidth;
        this.left = p.left < 0 ? 0 : p.left;
        let leftCorrection = (this.left + tooltip.clientWidth) - leftLimit;


        this.left = leftCorrection > 0 ? (this.left - leftCorrection - 5) : this.left;

        this.isIn = true;
        if (this.animation)
            this.isFade = true;
    }

    hide(): void {
        if (this.mouseIn) return;

        this.sizeWasChanged = false;

        this.top = -100000;
        this.left = -100000;
        this.isIn = true;
        if (this.animation)
            this.isFade = false;
    }

    // -------------------------------------------------------------------------
    // Private Methods
    // -------------------------------------------------------------------------

    private positionElements(hostEl: HTMLElement, targetEl: HTMLElement, positionStr: string, appendToBody: boolean = false): { top: number, left: number } {
        let positionStrParts = positionStr.split('-');
        let pos0 = positionStrParts[0];
        let pos1 = positionStrParts[1] || 'center';
        let hostElPos = appendToBody ? this.offset(hostEl) : this.position(hostEl);
        let targetElWidth = targetEl.offsetWidth;
        let targetElHeight = targetEl.offsetHeight;
        let shiftWidth: any = {
            center: function (): number {
                return hostElPos.left + hostElPos.width / 2 - targetElWidth / 2;
            },
            left: function (): number {
                return hostElPos.left;
            },
            right: function (): number {
                return hostElPos.left + hostElPos.width;
            }
        };

        let shiftHeight: any = {
            center: function (): number {
                return hostElPos.top + hostElPos.height / 2 - targetElHeight / 2;
            },
            top: function (): number {
                return hostElPos.top;
            },
            bottom: function (): number {
                return hostElPos.top + hostElPos.height;
            }
        };

        let targetElPos: { top: number, left: number };
        switch (pos0) {
            case 'right':
                targetElPos = {
                    top: shiftHeight[pos1](),
                    left: shiftWidth[pos0]()
                };
                break;

            case 'left':
                targetElPos = {
                    top: shiftHeight[pos1](),
                    left: hostElPos.left - targetElWidth
                };
                break;

            case 'bottom':
                targetElPos = {
                    top: shiftHeight[pos0](),
                    left: shiftWidth[pos1]()
                };
                break;

            default:
                targetElPos = {
                    top: hostElPos.top - targetElHeight,
                    left: shiftWidth[pos1]()
                };
                break;
        }

        return targetElPos;
    }

    private position(nativeEl: HTMLElement): { width: number, height: number, top: number, left: number } {
        let offsetParentBCR = {top: 0, left: 0};
        const elBCR = this.offset(nativeEl);
        const offsetParentEl = this.parentOffsetEl(nativeEl);
        if (offsetParentEl !== window.document) {
            offsetParentBCR = this.offset(offsetParentEl);
            offsetParentBCR.top += offsetParentEl.clientTop - offsetParentEl.scrollTop;
            offsetParentBCR.left += offsetParentEl.clientLeft - offsetParentEl.scrollLeft;
        }
        const boundingClientRect = nativeEl.getBoundingClientRect();
        return {
            width: boundingClientRect.width || nativeEl.offsetWidth,
            height: boundingClientRect.height || nativeEl.offsetHeight,
            top: elBCR.top - offsetParentBCR.top,
            left: elBCR.left - offsetParentBCR.left
        };
    }

    private offset(nativeEl: any): { width: number, height: number, top: number, left: number } {
        const boundingClientRect = nativeEl.getBoundingClientRect();
        return {
            width: boundingClientRect.width || nativeEl.offsetWidth,
            height: boundingClientRect.height || nativeEl.offsetHeight,
            top: boundingClientRect.top + (window.pageYOffset || window.document.documentElement.scrollTop),
            left: boundingClientRect.left + (window.pageXOffset || window.document.documentElement.scrollLeft)
        };
    }

    private getStyle(nativeEl: HTMLElement, cssProp: string): string {
        if ((nativeEl as any).currentStyle) // IE
            return (nativeEl as any).currentStyle[cssProp];

        if (window.getComputedStyle)
            return (window.getComputedStyle(nativeEl) as any)[cssProp];

        // finally try and get inline style
        return (nativeEl.style as any)[cssProp];
    }

    private isStaticPositioned(nativeEl: HTMLElement): boolean {
        return (this.getStyle(nativeEl, 'position') || 'static' ) === 'static';
    }

    private parentOffsetEl(nativeEl: HTMLElement): any {
        let offsetParent: any = nativeEl.offsetParent || window.document;
        while (offsetParent && offsetParent !== window.document && this.isStaticPositioned(offsetParent)) {
            offsetParent = offsetParent.offsetParent;
        }
        return offsetParent || window.document;
    }

}