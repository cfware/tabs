import ShadowElement, {html, template, css, adoptedStyleSheets, define} from '@cfware/shadow-element';

const selectedIndexAttribute = 'selected-index';
class CFWareTabs extends ShadowElement {
    _updateActives(index = this.selectedIndex) {
        const title = this.querySelectorAll('[slot=title]')[index];
        const contents = this.querySelectorAll('[slot=contents]')[index];
        for (const element of this.querySelectorAll('[active]')) {
            element.removeAttribute('active');
        }

        title?.setAttribute('active', '');
        /* istanbul ignore else: paranoid check */
        if (contents) {
            contents.setAttribute('active', '');
            contents.querySelector(contents.getAttribute('focus') ?? '[name]:read-write')?.focus();
        }
    }

    get selectedIndex() {
        return Number(this.getAttribute(selectedIndexAttribute) ?? -1);
    }

    set selectedIndex(index) {
        if (this.selectedIndex !== index) {
            this.setAttribute(selectedIndexAttribute, index);
            this._updateActives(index);
        }
    }

    static [adoptedStyleSheets] = [
        css`
            :host {
                display: grid;
                grid-template-rows: auto 1fr;
                overflow: hidden;
            }

            div {
                display: grid;
                grid-template-columns: auto 1fr;
            }

            [name=title] {
                display: grid;
                grid-auto-flow: column;
            }

            ::slotted([slot=title]) {
                cursor: pointer;
                user-select: none;
                padding: .5rem 1rem;
                border-radius: 4px 4px 0 0;
                color: #444;
            }

            ::slotted([slot=title][active]) {
                cursor: default;
                box-shadow: 0 .2rem 0 inset;
                color: #000;
                background-color: #ddd;
            }

            ::slotted([slot=title]:not([active]):hover) {
                color: #005d90;
            }

            :host([selected-index='0']) ::slotted([slot=contents][active]) {
                border-top-left-radius: 0;
            }

            ::slotted([slot=contents]:not([active])) {
                display: none;
            }

            ::slotted([slot=contents][active]) {
                background-color: #ddd;
                border-radius: 4px;
                overflow: auto;
                padding: 1rem;
                padding-bottom: 0;
            }

            ::slotted([slot=contents][active])::after {
                content: "";
                display: block;
                height: 1rem;
            }
        `
    ];

    get [template]() {
        if (this.selectedIndex < 0) {
            this.selectedIndex = 0;
        } else {
            this._updateActives();
        }

        const onclick = event => {
            let {target} = event;
            while (target && !target.assignedSlot) {
                target = target.parentNode;
            }

            const selectedIndex = target?.assignedSlot.assignedNodes().indexOf(target) ??
                /* istanbul ignore next: paranoid check */ -1;
            /* istanbul ignore else: paranoid check */
            if (selectedIndex >= 0) {
                this.selectedIndex = selectedIndex;
            }
        };

        return html`
            <div>
                <slot name="title" onclick=${onclick} onslotchange=${() => this._updateActives()} />
                <span />
            </div>
            <slot name="contents" onslotchange=${() => this._updateActives()} />
        `;
    }
}

CFWareTabs[define]('cfware-tabs');
