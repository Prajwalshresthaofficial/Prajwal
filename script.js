/**
 * Prajwal's Share Tax Logic Engine
 * Detailed Breakdown: Commission, SEBON, DP Charge
 * Rounding Rule: Up only if 3rd decimal > 5
 */

function taxCalculator() {
    return {
        qty: '',       
        buyPrice: '',  
        sellPrice: '', 
        holding: 'long', 
        
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
            if (!this.qty || !this.buyPrice || !this.sellPrice) {
                return { 
                    buyComm: "0.00", buySebon: "0.00", wacc: "0.00",
                    sellComm: "0.00", sellSebon: "0.00", dp: "25.00",
                    cgt: "0.00", receivable: "0.00", profit: "0.00", isProfit: true 
                };
            }

            const sebonRate = 0.00015;
            const dpFee = 25;
            const minBrokerComm = 10;

            const calculateCommission = (amount) => {
                let rate = amount <= 50000 ? 0.0036 : 
                           amount <= 500000 ? 0.0033 : 
                           amount <= 2000000 ? 0.00306 : 
                           amount <= 10000000 ? 0.0027 : 0.00243;
                return Math.max(amount * rate, minBrokerComm);
            };

            // 1. Purchase Side Calculations
            const totalBuyBase = this.qty * this.buyPrice;
            const bComm = calculateCommission(totalBuyBase);
            const bSebon = totalBuyBase * sebonRate;
            const totalInvestment = totalBuyBase + bComm + bSebon + dpFee;

            // 2. Selling Side Calculations
            const totalSellBase = this.qty * this.sellPrice;
            const sComm = calculateCommission(totalSellBase);
            const sSebon = totalSellBase * sebonRate;
            
            // 3. Tax Logic (5%, 7.5%, or 10%)
            const taxableProfit = totalSellBase - sComm - sSebon - dpFee - totalInvestment;
            let cgtRate = 0.05; 
            if (this.holding === 'short') cgtRate = 0.075;
            if (this.holding === 'institutional') cgtRate = 0.10;

            const tax = taxableProfit > 0 ? (taxableProfit * cgtRate) : 0;

            // 4. Final Totals
            const netReceivable = totalSellBase - sComm - sSebon - dpFee - tax;
            const netProfit = netReceivable - totalInvestment;

            return {
                buyComm: this.customRound(bComm),
                buySebon: this.customRound(bSebon),
                wacc: this.customRound(totalInvestment),
                sellComm: this.customRound(sComm),
                sellSebon: this.customRound(sSebon),
                dp: "25.00",
                cgt: this.customRound(tax),
                receivable: this.customRound(netReceivable),
                profit: this.customRound(netProfit),
                isProfit: netProfit >= 0
            };
        }
    }
}