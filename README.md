> This repository is for demonstration purposes of how it can be implemented in Angular and is not maintaned. Please fork and maintain your own version of this repository.

> It is a fork of ngx-tooltip of Umed Khudoiberdiev made by me for my specific case.

# ngx-tooltip-selectable

Simple tooltip control for your angular2 applications using bootstrap3. Does not depend of jquery.
If you want to use it without bootstrap - simply create proper css classes. 


## Installation

1. Install npm module:

    `npm install ngx-tooltip --save`

2. If you are using system.js you may want to add this into `map` and `package` config:

    ```json
    {
        "map": {
            "ngx-tooltip": "node_modules/ngx-tooltip"
        },
        "packages": {
            "ngx-tooltip": { "main": "index.js", "defaultExtension": "js" }
        }
    }
    ```

## Usage


Example of usage with dynamic html content (the only way for now):

```html
<tooltip-content #myTooltip 
[animation]="true" 
[hideTimeoutMs]="150"
placement="left"
[changeSize]="expandedTooltip"
(clickOutside)="tooltipVisibility={value: false, clickOutside: true}"
>
    <b>Very</b> <span style="color: #C21F39">Dynamic</span> <span style="color: #00b3ee">Reusable</span>
    <b><i><span style="color: #ffc520">Tooltip With</span></i></b> <small>Html support</small>.
</tooltip-content>

<button [tooltip]="myTooltip"
         [tooltipPlacement]="tooltipPosition"
         [visibility]="tooltipVisibility" 
         [keepOnMouseHover]="false"
>element on which this tooltip is applied.</button>
```

* `<span tooltip>`:
    * `tooltip="tamplateID"` templateID of tooltip-content container to be shown in the tooltip.
    * `[visibility]="boolean"` Manually show/hide tooltips in some specific cases.
    * `[tooltipDisabled]="true|false"` Indicates if tooltip should be disabled. If tooltip is disabled then it will not be shown. Default is **false**
    * `[tooltipAnimation]="true|false"` Indicates if all tooltip will have animation class from bootstrap applied or not. Default is **true**.
    * `tooltipPlacement="top|bottom|left|right"` Indicates where the tooltip should be placed. Default is **"bottom"**.
* `<tooltip-content>`:
    * `[animation]="true|false"` Indicates if all tooltip should be shown with bootstrap animation or not. Default is **true**. Possibly will be Deprecated soon.
    * `placement="top|bottom|left|right"` Indicates where the tooltip should be placed. Default is **"bottom"**.
    * `[hideTimeoutMs]="150"` Indicates tooltip auto-hide timespan after mouse-leaving of tooltip area. Default is **"150"**.
    * `[keepOnMouseHover]="false"` Switchs on and off tooltip keeping being displayed on its area mouse hover (and text copy). Default is **"true"**.
    * `[changeSize]="variable"` If you plan to place some cotrols on tooltip area that change its size - then you should feed some variable change (from false to true and vice-versa) in this INPUT to recalculate tooltip position.
    * `(clickOutside)="tooltipVisibility={value: false, clickOutside: true}"` . Since you are able to copy text from tooltip area and change its size - then auto-hiding is disabled after size-change of tooltip - use (clickOutside) to hide tooltip (clickOutside is not part of the module, install it by yourself separately)

## Sample

```typescript
import {Component} from "@angular/core";
import {TooltipModule} from "ngx-tooltip-selectable";

@Component({
    selector: "app",
    template: `
<div class="container">

    <div class="tooltip-spot"
         [tooltipPlacement]="tooltipPosition"
         [tooltip]="myTooltip"
         [visibility]="tooltipVisibility"
         (mouseenter)="tooltipVisibility=true"
         (mouseleave)="tooltipVisibility=false"
    >
    </div>

    <tooltip-content #myTooltip class="tooltip-area"
                     [ngClass]="{expanded: expandedTooltip}"
                     (clickOutside)="tooltipVisibility={value: false, clickOutside: true}"
                     [hideTimeoutMs]="250"
                     [changeSize]="expandedTooltip">
        <div class="base-info" >
            Main info {{variable}}
        </div>
        <div *ngIf="expandedTooltip">
            More info {{moreINfoVariable}}
        </div>

        <button class="expand-button" (click)="expandedTooltip=!expandedTooltip">More info...</button>
    </tooltip-content>

</div>
`
})
export class App implements {
    
    public tooltipPosition: string = 'bottom';
    public tooltipVisibility: {value: boolean, clickOutside?: boolean} = {value: false};
    public expandedTooltip: boolean = false;

}

@NgModule({
    imports: [
        // ...
        TooltipModule
    ],
    declarations: [
        App
    ],
    bootstrap: [
        App
    ]
})
export class AppModule {

}
```

*One more note - tooltip-content component apply 'tooltip' class on its template wrapper div. 
You can set css rules to this class. And don't forget "position: absolute" since I've tested it only with this positioning.


## Publishing

1. Make a fork on github

2. npm install

    `npm install`

3. Do the changes (src, README.md and package.json) and then publish:

    `gulp publish`
    
## Development

1. Build the package:

    `gulp publish`
    
2. go to package dir:

    `cd ./build/package`
    
3. Run 'npm link' in that dir

4. Go to your project root dir and run 'npm link ngx-tooltip-selectable'

5. Now to can import this module to your NG2 app.

6. In case of any changes in module - just run step 1 again (sometimes steps 2 and 3 if smth)
