/**
 * Prajwal's Share Tax Tool - Final Revised Logic
 * Includes: Buy/Sell Toggle, Clear Function, and Zero-Value Protection
 */

function taxCalculator() {
    return {
        mode: 'buy', 
        qty: '',       
        buyPrice: '',  
        sellPrice: '', 
        holding: 'long', 
        
        // Resets all input fields to default
        clearFields() {
            this.qty = '';
            this.buyPrice = '';
            this.sellPrice = '';
            this.holding = 'long';
        },

        // Custom rounding: Rounds up only if the 3rd decimal > 5
        customRound(num) {
            if (isNaN(num) || num === null || num === 0) return "0.00";
            const str = num.toString();
            if (!str.includes('.')) return num.toFixed(2);
            
            const [intPart, decPart] = str.split('.');
            if (decPart.length >= 3) {
                const thirdDigit = parseInt(decPart[2]);
                if (thirdDigit > 5) {
                    return (Math.round(num * 100) / 100).toFixed(2);
                } else {
                    return (Math.floor(num * 100) / 100).toFixed(2);
                }
            }
            return num.toFixed(2);
        },

        get results() {
            const sebonRate = 0.00015;
            const dpFee = 25;
            const minBrokerComm = 10;

            // NEPSE Broker Commission Tiers
            const getComm = (amount) => {
                if (amount === 0) return 0;
                let rate = amount <= 50000 ? 0.0036 : 
                           amount <= 500000 ? 0.0033 : 
                           amount <= 2000000 ? 0.00306 : 
                           amount <= 10000000 ? 0.0027 : 0.00243;
                return Math.max(amount * rate, minBrokerComm);
            };

            // 1. Purchase Calculations
            const buyAmt = (this.qty || 0) * (this.buyPrice || 0);
            const bComm = buyAmt > 0 ? getComm(buyAmt) : 0;
            const bSebon = buyAmt * sebonRate;
            const totalBuy = buyAmt > 0 ? (buyAmt + bComm + bSebon + dpFee) : 0;

            // 2. Selling Calculations
            const sellAmt = (this.qty || 0) * (this.sellPrice || 0);
            const sComm = sellAmt > 0 ? getComm(sellAmt) : 0;
            const sSebon = sellAmt * sebonRate;
            
            // 3. Profit & Tax Logic
            const taxableProfit = (sellAmt - sComm - sSebon - dpFee) - totalBuy;
            let cgtRate = (this.holding === 'short') ? 0.075 : (this.holding === 'institutional' ? 0.10 : 0.05);
            const tax = (this.mode === 'sell' && taxableProfit > 0) ? (taxableProfit * cgtRate) : 0;

            // 4. Zero-Value Protection: Prevents showing -25.00
            const hasValidInput = (this.qty > 0 && (this.buyPrice > 0 || this.sellPrice > 0));
            
            const netRec = hasValidInput ? (sellAmt - sComm - sSebon - dpFee - tax) : 0;
            const netProfit = hasValidInput ? (netRec - totalBuy) : 0;

            return {
                buyComm: this.customRound(bComm),
                buySebon: this.customRound(bSebon),
                wacc: this.customRound(totalBuy),
                sellComm: this.customRound(sComm),
                sellSebon: this.customRound(sSebon),
                dp: hasValidInput ? "25.00" : "0.00",
                cgt: this.customRound(tax),
                receivable: this.customRound(netRec),
                profit: this.customRound(netProfit),
                isProfit: netProfit >= 0
            };
        }
    }
}
