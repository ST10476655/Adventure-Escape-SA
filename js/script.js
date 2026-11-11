// =====================================
// ADVENTURE ESCAPE SA
// FEE CALCULATOR
// =====================================

document.addEventListener("DOMContentLoaded", function () {

    // Calculate Button

    const calculateBtn =
        document.getElementById("calculateBtn");

    // Submit Button

    const submitBtn =
        document.getElementById("submitBtn");

    // Quote Summary Area

    const quoteSummary =
        document.getElementById("quoteSummary");

    // =====================================
    // CALCULATE BUTTON
    // =====================================

    calculateBtn.addEventListener("click", function () {

        // Customer Information

        const customerName =
            document.getElementById("customerName").value;

        const customerPhone =
            document.getElementById("customerPhone").value;

        const customerEmail =
            document.getElementById("customerEmail").value;

        // Validation

        if (
            customerName === "" ||
            customerPhone === "" ||
            customerEmail === ""
        ) {

            alert(
                "Please complete all customer information."
            );

            return;
        }

        // Get Selected Adventures

        const selectedPackages =
            document.querySelectorAll(".package:checked");

        let subtotal = 0;

        let count =
            selectedPackages.length;

        selectedPackages.forEach(function (packageItem) {

            subtotal += Number(
                packageItem.value
            );

        });

        // Discount

        let discount = 0;

        if (count === 2) {

            discount = subtotal * 0.05;
        }

        else if (count === 3) {

            discount = subtotal * 0.10;
        }

        else if (count > 3) {

            discount = subtotal * 0.15;
        }

        // VAT

        let afterDiscount =
            subtotal - discount;

        let vat =
            afterDiscount * 0.15;

        let total =
            afterDiscount + vat;

        // Display Summary

        quoteSummary.innerHTML =

        `
        <strong>Customer:</strong>
        ${customerName}

        <br><br>

        <strong>Subtotal:</strong>
        R${subtotal.toFixed(2)}

        <br><br>

        <strong>Discount:</strong>
        R${discount.toFixed(2)}

        <br><br>

        <strong>VAT (15%):</strong>
        R${vat.toFixed(2)}

        <br><br>

        <strong>Total:</strong>
        R${total.toFixed(2)}
        `;
    });

    // =====================================
    // SUBMIT BUTTON
    // =====================================

    submitBtn.addEventListener("click", function () {

        alert(
            "Booking Request Submitted Successfully!"
        );

    });

});