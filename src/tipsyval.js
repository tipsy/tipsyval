(function () {

    function TipsyVal() {

        this.customValidationFunctions = {};

        this.setCustomValidation = (inputId, func) => this.customValidationFunctions[inputId] = func;

        this.fieldValid = field => {
            return !isEmpty(field) && !isInvalid(field);
        };

        this.formValid = form => {
            let inputs = form.querySelectorAll("[data-tipsyval-empty-msg]");
            for (let i = 0; i < inputs.length; i++) {
                if (!this.fieldValid(inputs[i])) {
                    return false;
                }
            }
            return true;
        };

        this.triggerValidation = input => triggerValidation(input);

        let arrowSize = 6;
        let currentInput;

        let isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

        let tooltipCss = `
            z-index: 999999999;
            font: 15px arial;
            position: fixed;
            background: #fff;
            background: linear-gradient(#fff, #f5f5f5);
            color: #444;
            padding: 10px;
            margin-right: 10px;
            max-width: 400px;
            border: 1px solid #aaa;
            border-radius: 2px;
            border-top: 2px solid orange;
            box-shadow: 0 0 8px rgba(0,0,0,0.15), 
                        0 0 30px rgba(0,0,0,0.125);
        `;

        let arrowCss = `
            position: fixed;
            width: 0; 
            height: 0; 
            border-left: ${arrowSize}px solid transparent;
            border-right: ${arrowSize}px solid transparent;
            border-bottom: ${arrowSize}px solid orange;
        `;

        function triggerValidation(input) {
            let messageType = input.value.length === 0 ? "empty" : "invalid";
            closeValidation();
            currentInput = input;
            window.scrollTo(0, input.getBoundingClientRect().top - 20);
            setTimeout(() => {
                document.body.insertAdjacentHTML("beforeEnd", `
                  <div id="tipsyval" style="${tooltipCss}">
                     <div id="tipsyval-arrow" style="${arrowCss}"></div>
                     ${input.getAttribute(`data-tipsyval-${messageType}-msg`)}
                  </div>
                `);
                positionPopover();
            }, 200);
        }

        function positionPopover() {
            if (document.getElementById("tipsyval") !== null) {
                let bottom = currentInput.getBoundingClientRect().bottom;
                let left = currentInput.getBoundingClientRect().left;
                if (isIosDevice && document.activeElement.tagName === "INPUT") { // praise the spaghetti monster: http://javascript.info/tutorial/coordinates
                    let scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
                    let scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft;
                    let clientTop = document.documentElement.clientTop || document.body.clientTop || 0;
                    let clientLeft = document.documentElement.clientLeft || document.body.clientLeft || 0;
                    bottom += (scrollTop - clientTop);
                    left += (scrollLeft - clientLeft);
                }
                document.getElementById("tipsyval" + "-arrow").style.top = `${bottom}px`;
                document.getElementById("tipsyval" + "-arrow").style.left = `${left + 20}px`;
                document.getElementById("tipsyval").style.top = `${bottom + arrowSize}px`;
                document.getElementById("tipsyval").style.left = `${left + 10}px`;
            }
        }

        function closeValidation() {
            if (document.getElementById("tipsyval") !== null) {
                document.body.removeChild(document.getElementById("tipsyval"));
            }
        }

        function isEmpty(input) {
            return input.value.length === 0;
        }

        let isInvalid = input => {
            if (input.getAttribute("data-tipsyval-pattern") !== null) {
                return !(new RegExp(input.getAttribute("data-tipsyval-pattern")).test(input.value))
            }
            if (this.customValidationFunctions[input.id] !== undefined) {
                return !this.customValidationFunctions[input.id](input);
            }
        };

        // Make sure popover stays position in case of scrolling/resizing
        setInterval(() => positionPopover(), 10);

        // Catch any form submits and run validation on tipsyval-fields in the form
        document.addEventListener("submit", e => {
            e.preventDefault();
            closeValidation();
            let form = e.target;
            let inputs = form.querySelectorAll("[data-tipsyval-empty-msg]");
            for (let i = 0; i < inputs.length; i++) {
                if (isEmpty(inputs[i]) || isInvalid(inputs[i])) {
                    return triggerValidation(inputs[i]);
                }
            }
            if (this.formValid(form) && form.getAttribute("data-tipsyval-submit-if-valid") === "true") {
                form.submit();
            }
        }, true);

        document.addEventListener("input", () => closeValidation());
        document.addEventListener("click", e => closeIfNotTarget(e));
        document.addEventListener("touchend", e => closeIfNotTarget(e));

        function closeIfNotTarget(e) {
            if (e.target !== currentInput) {
                closeValidation();
            }
        }

    }

    window.TipsyVal = new TipsyVal();

})();
