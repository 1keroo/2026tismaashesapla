// Modal kontrolü
document.addEventListener('DOMContentLoaded', function() {
    const warningModal = document.getElementById('warningModal');
    const mainContent = document.getElementById('mainContent');
    const continueBtn = document.getElementById('continueBtn');
    
    continueBtn.addEventListener('click', function() {
        warningModal.classList.add('hidden');
        mainContent.classList.remove('hidden');
    });
});

// Hesaplama fonksiyonu
document.getElementById('calculateBtn').addEventListener('click', calculate);

// Enter tuşu ile hesaplama
document.getElementById('currentWage').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        calculate();
    }
});

document.getElementById('monthlyHours').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        calculate();
    }
});

function calculate() {
    const currentWageInput = parseFloat(document.getElementById('currentWage').value);
    const monthlyHours = parseFloat(document.getElementById('monthlyHours').value) || 225;
    
    if (!currentWageInput || currentWageInput <= 0) {
        alert('Lütfen geçerli bir saat ücreti giriniz!');
        return;
    }
    
    if (!monthlyHours || monthlyHours <= 0) {
        alert('Lütfen geçerli bir çalışma saati giriniz!');
        return;
    }
    
    // Hesaplama adımları
    const steps = [];
    let currentWage = currentWageInput;
    
    // 1. Adım: İyileştirme (140 TL altındaki ücretlere 10 TL)
    let improvement = 0;
    if (currentWage < 140) {
        improvement = 10;
        currentWage += improvement;
        steps.push(`✓ Adım 1: İyileştirme (${currentWageInput.toFixed(2)} TL < 140 TL) → +10 TL = ${currentWage.toFixed(2)} TL`);
    } else {
        steps.push(`✓ Adım 1: İyileştirme uygulanmadı (${currentWageInput.toFixed(2)} TL ≥ 140 TL)`);
    }
    
    // 2. Adım: %20 zam
    const increaseAmount = currentWage * 0.20;
    currentWage += increaseAmount;
    steps.push(`✓ Adım 2: %20 Zam → +${increaseAmount.toFixed(2)} TL = ${currentWage.toFixed(2)} TL`);
    
    // 3. Adım: Seyyanen 17,61 TL
    const fixedAmount = 17.61;
    currentWage += fixedAmount;
    steps.push(`✓ Adım 3: Seyyanen Ekleme → +${fixedAmount} TL = ${currentWage.toFixed(2)} TL`);
    
    const newWage = currentWage;
    
    // Aylık brüt hesaplama
    const currentMonthlyGross = currentWageInput * monthlyHours;
    const newMonthlyGross = newWage * monthlyHours;
    
    // Net maaş hesaplama - Mevcut durum
    const currentNet = calculateNetSalary(currentMonthlyGross);
    const newNet = calculateNetSalary(newMonthlyGross);
    
    // Artışlar
    const hourlyIncrease = newWage - currentWageInput;
    const grossIncrease = newMonthlyGross - currentMonthlyGross;
    const netIncrease = newNet.netSalary - currentNet.netSalary;
    const increasePercent = ((netIncrease / currentNet.netSalary) * 100);
    
    // Sonuçları göster
    displayResults({
        currentWage: currentWageInput,
        newWage: newWage,
        currentMonthlyGross: currentMonthlyGross,
        newMonthlyGross: newMonthlyGross,
        currentNet: currentNet.netSalary,
        newNet: newNet.netSalary,
        hourlyIncrease: hourlyIncrease,
        grossIncrease: grossIncrease,
        netIncrease: netIncrease,
        increasePercent: increasePercent,
        steps: steps,
        currentDeductions: currentNet.deductions,
        newDeductions: newNet.deductions,
        monthlyHours: monthlyHours,
        currentTaxRate: currentNet.taxRate,
        newTaxRate: newNet.taxRate
    });
}

function calculateNetSalary(grossSalary) {
    // SGK İşçi Payı (%14)
    const sgkEmployee = grossSalary * 0.14;
    
    // İşsizlik Sigortası İşçi Payı (%1)
    const unemploymentInsurance = grossSalary * 0.01;
    
    // Vergi Matrahı
    const taxBase = grossSalary - sgkEmployee - unemploymentInsurance;
    
    // Gelir Vergisi Dilimi Belirleme (Aylık)
    let taxRate = 0;
    let incomeTax = 0;
    
    if (taxBase <= 12500) {
        taxRate = 15;
        incomeTax = taxBase * 0.15;
    } else if (taxBase <= 32000) {
        taxRate = 20;
        incomeTax = 12500 * 0.15 + (taxBase - 12500) * 0.20;
    } else if (taxBase <= 75000) {
        taxRate = 27;
        incomeTax = 12500 * 0.15 + 19500 * 0.20 + (taxBase - 32000) * 0.27;
    } else if (taxBase <= 333000) {
        taxRate = 35;
        incomeTax = 12500 * 0.15 + 19500 * 0.20 + 43000 * 0.27 + (taxBase - 75000) * 0.35;
    } else {
        taxRate = 40;
        incomeTax = 12500 * 0.15 + 19500 * 0.20 + 43000 * 0.27 + 258000 * 0.35 + (taxBase - 333000) * 0.40;
    }
    
    // Damga Vergisi (%0.759)
    const stampTax = grossSalary * 0.00759;
    
    // Toplam Kesintiler
    const totalDeductions = sgkEmployee + unemploymentInsurance + incomeTax + stampTax;
    
    // Net Maaş
    const netSalary = grossSalary - totalDeductions;
    
    return {
        netSalary: netSalary,
        taxRate: taxRate,
        deductions: {
            sgk: sgkEmployee,
            unemployment: unemploymentInsurance,
            incomeTax: incomeTax,
            stampTax: stampTax,
            total: totalDeductions,
            taxBase: taxBase
        }
    };
}

function displayResults(data) {
    // Sonuçları göster
    document.getElementById('results').classList.remove('hidden');
    
    // Mevcut durum
    document.getElementById('currentHourly').textContent = formatCurrency(data.currentWage);
    document.getElementById('currentGross').textContent = formatCurrency(data.currentMonthlyGross);
    document.getElementById('currentNet').textContent = formatCurrency(data.currentNet);
    
    // Yeni durum
    document.getElementById('newHourly').textContent = formatCurrency(data.newWage);
    document.getElementById('newGross').textContent = formatCurrency(data.newMonthlyGross);
    document.getElementById('newNet').textContent = formatCurrency(data.newNet);
    
    // Artışlar
    document.getElementById('hourlyIncrease').textContent = formatCurrency(data.hourlyIncrease);
    document.getElementById('grossIncrease').textContent = formatCurrency(data.grossIncrease);
    document.getElementById('netIncrease').textContent = formatCurrency(data.netIncrease);
    document.getElementById('increasePercent').textContent = '%' + data.increasePercent.toFixed(2);
    
    // Hesaplama adımları
    const stepsList = document.getElementById('stepsList');
    stepsList.innerHTML = '';
    
    stepsList.innerHTML += `<div class="step-item"><strong>Başlangıç:</strong> Saat ücreti ${formatCurrency(data.currentWage)} × ${data.monthlyHours} saat = ${formatCurrency(data.currentMonthlyGross)} (Aylık Brüt)</div>`;
    
    data.steps.forEach(step => {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step-item';
        stepDiv.textContent = step;
        stepsList.appendChild(stepDiv);
    });
    
    stepsList.innerHTML += `<div class="step-item"><strong>Sonuç:</strong> Yeni saat ücreti ${formatCurrency(data.newWage)} × ${data.monthlyHours} saat = ${formatCurrency(data.newMonthlyGross)} (Aylık Brüt)</div>`;
    
    // Vergi dilimi bilgisi
    const getTaxBracketInfo = (rate) => {
        switch(rate) {
            case 15: return "1. Dilim (0-12.500 TL)";
            case 20: return "2. Dilim (12.501-32.000 TL)";
            case 27: return "3. Dilim (32.001-75.000 TL)";
            case 35: return "4. Dilim (75.001-333.000 TL)";
            case 40: return "5. Dilim (333.001 TL+)";
            default: return "Bilinmiyor";
        }
    };
    
    // Mevcut kesintiler
    const currentDeductionsDiv = document.getElementById('currentDeductions');
    currentDeductionsDiv.innerHTML = `
        <div class="tax-bracket-info">
            <strong>📊 Vergi Dilimi: %${data.currentTaxRate}</strong><br>
            <small>${getTaxBracketInfo(data.currentTaxRate)}</small><br>
            <small>Vergi Matrahı: ${formatCurrency(data.currentDeductions.taxBase)}</small>
        </div>
        <div class="deduction-item">
            <span>Brüt Maaş:</span>
            <span>${formatCurrency(data.currentMonthlyGross)}</span>
        </div>
        <div class="deduction-item">
            <span>SGK İşçi Payı (%14):</span>
            <span>-${formatCurrency(data.currentDeductions.sgk)}</span>
        </div>
        <div class="deduction-item">
            <span>İşsizlik Sigortası (%1):</span>
            <span>-${formatCurrency(data.currentDeductions.unemployment)}</span>
        </div>
        <div class="deduction-item">
            <span>Gelir Vergisi (%${data.currentTaxRate}):</span>
            <span>-${formatCurrency(data.currentDeductions.incomeTax)}</span>
        </div>
        <div class="deduction-item">
            <span>Damga Vergisi (%0.759):</span>
            <span>-${formatCurrency(data.currentDeductions.stampTax)}</span>
        </div>
        <div class="deduction-item">
            <span><strong>Toplam Kesinti:</strong></span>
            <span><strong>-${formatCurrency(data.currentDeductions.total)}</strong></span>
        </div>
        <div class="deduction-item" style="background: #e8f5e9; margin-top: 10px; padding: 10px; border-radius: 5px;">
            <span><strong>NET MAAŞ:</strong></span>
            <span><strong>${formatCurrency(data.currentNet)}</strong></span>
        </div>
    `;
    
    // Yeni kesintiler
    const newDeductionsDiv = document.getElementById('newDeductions');
    
    // Vergi dilimi değişikliği kontrolü
    let taxBracketChange = '';
    if (data.currentTaxRate !== data.newTaxRate) {
        taxBracketChange = `<div class="tax-change-alert">⚠️ Vergi diliminiz %${data.currentTaxRate}'den %${data.newTaxRate}'e çıkacak!</div>`;
    }
    
    newDeductionsDiv.innerHTML = `
        ${taxBracketChange}
        <div class="tax-bracket-info">
            <strong>📊 Vergi Dilimi: %${data.newTaxRate}</strong><br>
            <small>${getTaxBracketInfo(data.newTaxRate)}</small><br>
            <small>Vergi Matrahı: ${formatCurrency(data.newDeductions.taxBase)}</small>
        </div>
        <div class="deduction-item">
            <span>Brüt Maaş:</span>
            <span>${formatCurrency(data.newMonthlyGross)}</span>
        </div>
        <div class="deduction-item">
            <span>SGK İşçi Payı (%14):</span>
            <span>-${formatCurrency(data.newDeductions.sgk)}</span>
        </div>
        <div class="deduction-item">
            <span>İşsizlik Sigortası (%1):</span>
            <span>-${formatCurrency(data.newDeductions.unemployment)}</span>
        </div>
        <div class="deduction-item">
            <span>Gelir Vergisi (%${data.newTaxRate}):</span>
            <span>-${formatCurrency(data.newDeductions.incomeTax)}</span>
        </div>
        <div class="deduction-item">
            <span>Damga Vergisi (%0.759):</span>
            <span>-${formatCurrency(data.newDeductions.stampTax)}</span>
        </div>
        <div class="deduction-item">
            <span><strong>Toplam Kesinti:</strong></span>
            <span><strong>-${formatCurrency(data.newDeductions.total)}</strong></span>
        </div>
        <div class="deduction-item" style="background: #e8f5e9; margin-top: 10px; padding: 10px; border-radius: 5px;">
            <span><strong>NET MAAŞ:</strong></span>
            <span><strong>${formatCurrency(data.newNet)}</strong></span>
        </div>
    `;
    
    // Sonuçlara scroll
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}
