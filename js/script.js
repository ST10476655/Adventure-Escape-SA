// =====================================
// ADVENTURE ESCAPE SA
// SHARED SCRIPT
// =====================================

// =====================================
// VALIDATION HELPERS
// =====================================

const NAME_PATTERN = /^[A-Za-z][A-Za-z\s'-]{1,49}$/;

// South African numbers: 0XX XXX XXXX or +27 XX XXX XXXX
const PHONE_PATTERN = /^(\+27|0)[1-9][0-9]{8}$/;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function showError(input, errorElement, message) {

    if (errorElement) {
        errorElement.textContent = message;
    }

    if (input) {
        input.classList.add("input-error");
        input.setAttribute("aria-invalid", "true");
    }
}

function clearError(input, errorElement) {

    if (errorElement) {
        errorElement.textContent = "";
    }

    if (input) {
        input.classList.remove("input-error");
        input.removeAttribute("aria-invalid");
    }
}

function validateName(value) {

    if (value === "") {
        return "Please enter your full name.";
    }

    if (!NAME_PATTERN.test(value)) {
        return "Name may only contain letters, spaces, hyphens and apostrophes.";
    }

    return "";
}

function validatePhone(value) {

    const cleaned = value.replace(/[\s()-]/g, "");

    if (cleaned === "") {
        return "Please enter your phone number.";
    }

    if (!PHONE_PATTERN.test(cleaned)) {
        return "Enter a valid South African number, e.g. 082 123 4567.";
    }

    return "";
}

function validateEmail(value) {

    if (value === "") {
        return "Please enter your email address.";
    }

    if (!EMAIL_PATTERN.test(value)) {
        return "Enter a valid email address, e.g. name@example.com.";
    }

    return "";
}

// Runs one validator on a field and shows or clears its error.
// Returns true when the field is valid.
function checkField(input, errorElement, validator) {

    if (!input) {
        return false;
    }

    const message = validator(input.value.trim());

    if (message) {
        showError(input, errorElement, message);
        return false;
    }

    clearError(input, errorElement);
    return true;
}

function formatRand(amount) {
    return "R" + amount.toFixed(2);
}

// =====================================
// FEE CALCULATOR
// =====================================

function setupFeeCalculator() {

    const calculateBtn = document.getElementById("calculateBtn");
    const submitBtn = document.getElementById("submitBtn");
    const quoteSummary = document.getElementById("quoteSummary");

    // Only run on the fee calculator page
    if (!calculateBtn || !submitBtn || !quoteSummary) {
        return;
    }

    const nameInput = document.getElementById("customerName");
    const phoneInput = document.getElementById("customerPhone");
    const emailInput = document.getElementById("customerEmail");

    const nameError = document.getElementById("customerNameError");
    const phoneError = document.getElementById("customerPhoneError");
    const emailError = document.getElementById("customerEmailError");
    const packageError = document.getElementById("packageError");
    const bookingStatus = document.getElementById("bookingStatus");

    const packages = document.querySelectorAll(".package");

    let quoteCalculated = false;

    function setStatus(message, type) {

        if (!bookingStatus) {
            return;
        }

        bookingStatus.textContent = message;
        bookingStatus.className = "form-status " + (type || "");
    }

    // Any change after a quote means the quote is out of date
    function invalidateQuote() {

        if (quoteCalculated) {
            quoteCalculated = false;
            setStatus("Your details changed. Please recalculate your quote.", "status-warning");
        }
    }

    // Check each field as soon as the user leaves it
    nameInput.addEventListener("blur", function () {
        checkField(nameInput, nameError, validateName);
    });

    phoneInput.addEventListener("blur", function () {
        checkField(phoneInput, phoneError, validatePhone);
    });

    emailInput.addEventListener("blur", function () {
        checkField(emailInput, emailError, validateEmail);
    });

    [nameInput, phoneInput, emailInput].forEach(function (input) {
        input.addEventListener("input", invalidateQuote);
    });

    packages.forEach(function (packageItem) {

        packageItem.addEventListener("change", function () {

            if (document.querySelectorAll(".package:checked").length > 0) {
                packageError.textContent = "";
            }

            invalidateQuote();
        });
    });

    function validateCustomer() {

        // Run all checks so every error shows at once
        const nameOk = checkField(nameInput, nameError, validateName);
        const phoneOk = checkField(phoneInput, phoneError, validatePhone);
        const emailOk = checkField(emailInput, emailError, validateEmail);

        return nameOk && phoneOk && emailOk;
    }

    // =====================================
    // CALCULATE BUTTON
    // =====================================

    calculateBtn.addEventListener("click", function () {

        setStatus("", "");

        const customerOk = validateCustomer();

        const selectedPackages = document.querySelectorAll(".package:checked");

        let packagesOk = true;

        if (selectedPackages.length === 0) {
            packageError.textContent = "Please select at least one adventure.";
            packagesOk = false;
        } else {
            packageError.textContent = "";
        }

        if (!customerOk || !packagesOk) {

            quoteCalculated = false;
            quoteSummary.textContent = "Please fix the highlighted fields to calculate your quote.";

            const firstInvalid = document.querySelector(".input-error");
            if (firstInvalid) {
                firstInvalid.focus();
            }

            return;
        }

        try {

            let subtotal = 0;
            const rows = [];

            selectedPackages.forEach(function (packageItem) {

                const price = Number(packageItem.value);

                if (Number.isNaN(price) || price <= 0) {
                    throw new Error("Invalid price for a selected adventure.");
                }

                subtotal += price;
                rows.push({
                    name: packageItem.parentElement.textContent.trim(),
                    price: price
                });
            });

            const count = selectedPackages.length;

            // Discount
            let discountRate = 0;

            if (count === 2) {
                discountRate = 0.05;
            } else if (count === 3) {
                discountRate = 0.10;
            } else if (count > 3) {
                discountRate = 0.15;
            }

            const discount = subtotal * discountRate;
            const afterDiscount = subtotal - discount;
            const vat = afterDiscount * 0.15;
            const total = afterDiscount + vat;

            // Build the quote as a table
            const table = document.createElement("table");
            table.className = "info-table quote-table";

            const caption = table.createCaption();
            caption.textContent = "Quote for " + nameInput.value.trim();

            const head = table.createTHead().insertRow();
            ["Item", "Amount"].forEach(function (label) {
                const th = document.createElement("th");
                th.scope = "col";
                th.textContent = label;
                head.appendChild(th);
            });

            const body = table.createTBody();

            function addRow(label, amount, className) {
                const row = body.insertRow();
                if (className) {
                    row.className = className;
                }
                row.insertCell().textContent = label;
                row.insertCell().textContent = amount;
            }

            rows.forEach(function (item) {
                addRow(item.name, formatRand(item.price));
            });

            addRow("Subtotal", formatRand(subtotal));
            addRow("Discount (" + Math.round(discountRate * 100) + "%)", "-" + formatRand(discount));
            addRow("VAT (15%)", formatRand(vat));
            addRow("Total", formatRand(total), "total-row");

            quoteSummary.innerHTML = "";
            quoteSummary.appendChild(table);

            quoteCalculated = true;

        } catch (error) {

            console.error(error);
            quoteCalculated = false;
            quoteSummary.textContent =
                "Sorry, we could not calculate your quote. Please refresh the page and try again.";
        }
    });

    // =====================================
    // SUBMIT BUTTON
    // =====================================

    submitBtn.addEventListener("click", function () {

        if (!validateCustomer()) {
            setStatus("Please complete your details before submitting.", "status-error");
            return;
        }

        if (!quoteCalculated) {
            setStatus("Please calculate your quote before submitting a booking request.", "status-error");
            return;
        }

        setStatus(
            "Thank you, " + nameInput.value.trim() +
            "! Your booking request has been submitted. We will contact you within 24 hours.",
            "status-success"
        );
    });
}

// =====================================
// START
// =====================================

document.addEventListener("DOMContentLoaded", function () {
    setupFeeCalculator();
});
