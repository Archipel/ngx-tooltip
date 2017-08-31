import {
    Component, Input, AfterViewInit, ElementRef, ChangeDetectorRef, OnChanges, OnInit,
    OnDestroy
} from '@angular/core';
import { Debounce } from './Debounce.decorator';
import * as _ from 'lodash';


let browser = {
    isIe: function () {
        return navigator.appVersion.indexOf('MSIE') != -1;
    },
    navigator: navigator.appVersion,
    getVersion: function () {
        let version = 999; // we assume a sane browser
        if (navigator.appVersion.indexOf('MSIE') != -1)
        // bah, IE again, lets downgrade version number
            version = parseFloat(navigator.appVersion.split('MSIE')[1]);
        return version;
    }
};

function forceReflow() {
    document.body.className = document.body.className;
};

@Component({
    selector: 'tooltip-content',
    template: `
        <div class="tooltip {{ placement }}"
             [style.top]="top + 'px'"
             [style.left]="left + 'px'"
             [class.in]="isIn"
             [class.fade]="isFade"
             role="tooltip">
            <div class="tooltip-inner">
                <ng-content></ng-content>
                {{ content }}
            </div>
        </div>
        <div class="tooltip-arrow"
             [style.left]="caretLeft"
             [style.top]="caretTop"
        ></div>
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

    @Input()
    keepOnMouseHover: boolean = true;
    // -------------------------------------------------------------------------
    // Properties
    // -------------------------------------------------------------------------

    top: number = -10000;
    left: number = -10000;
    caretLeft: string = '-10000px';
    caretTop: string = '-10000px';

    isIn: boolean = false;
    isFade: boolean = false;

    mouseIn: boolean = false;
    sizeWasChanged: boolean = false;

    preventAutoHide: boolean = false;

    onMouseEnter: Function;
    onMouseLeave: Function;

    edgeCorrection: number = 5;
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

        setTimeout(() => this.show(), 0);
    }

    ngAfterViewInit(): void {
        this.show();
        this.cdr.detectChanges();

        if (this.keepOnMouseHover) {
            this.element.nativeElement
                .addEventListener('mouseenter', this.onMouseEnter);

            this.element.nativeElement
                .addEventListener('mouseleave', this.onMouseLeave);
        }
    }

    ngOnDestroy() {
        if (this.keepOnMouseHover) {
            this.element.nativeElement
                .removeEventListener('mouseenter', this.onMouseEnter);

            this.element.nativeElement
                .removeEventListener('mouseleave', this.onMouseLeave);
        }
    }

    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    show(): void {

        if (browser.isIe() && browser.getVersion() <= 9) {
            forceReflow();
        }

        if (!this.hostElement) return;

        let tooltip = this.element.nativeElement.children[0];

        const p = this.positionElements(this.hostElement, tooltip, this.placement);

        this.caretLeft = this.hostElement.style.left;
        this.caretTop = this.hostElement.style.top;
        let parent = this.hostElement.offsetParent;
        let parentWidth = parent.clientWidth;
        let hostElementWidth = this.hostElement.offsetWidth;
        let tooltipWidth = tooltip.offsetWidth;


        let topCorrection = (p.top + tooltip.clientHeight) - this.hostElement.offsetTop;
        topCorrection = (this.placement === 'top') ? topCorrection : 0;
        this.top = p.top + topCorrection;

        let leftLimit = parentWidth;
        this.left = p.left < 0 ? 0 : p.left;
        let leftCorrection = (this.left + tooltipWidth) - leftLimit;

        if (this.placement === 'right') {
            this.caretLeft = parseInt(this.caretLeft, 10) + hostElementWidth + 'px';
        }

        this.left = leftCorrection > 0 ? (this.left - leftCorrection - this.edgeCorrection) : this.left;
        this.isIn = true;
        if (this.animation)
            this.isFade = true;
    }

    hide(): void {
        if (this.mouseIn) return;

        this.sizeWasChanged = false;

        this.top = -10000;
        this.left = -10000;


        this.caretLeft = '-10000px';
        this.caretTop = '-10000px';

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