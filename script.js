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

function calculate() {
    const currentWageInput = parseFloat(document.getElementById('currentWage').value);
    const monthlyHours = parseFloat(document.getElementById('monthlyHours').value) || 225;
    
    if (!currentWageInput || currentWageInput <= 0) {
        alert('Lütfen geçerli bir saat ücreti giriniz!');
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
    
    // Net maaş hesaplama (bordro mantığına göre)
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
        newDeductions: newNet.deductions
    });
}

function calculateNetSalary(grossSalary) {
    // SGK İşçi Payı (%14)
    const sgkEmployee = grossSalary * 0.14;
    
    // İşsizlik Sigortası İşçi Payı (%1)
    const unemploymentInsurance = grossSalary * 0.01;
    
    // Vergi Matrahı
    const taxBase = grossSalary - sgkEmployee - unemploymentInsurance;
    
    // Gelir Vergisi (2024 dilimleri - yaklaşık)
    let incomeTax = 0;
    if (taxBase <= 110000) {
        incomeTax = taxBase * 0.15;
    } else if (taxBase <= 230000) {
        incomeTax = 110000 * 0.15 + (taxBase - 110000) * 0.20;
    } else if (taxBase <= 580000) {
        incomeTax = 110000 * 0.15 + 120000 * 0.20 + (taxBase - 230000) * 0.27;
    } else if (taxBase <= 3000000) {
        incomeTax = 110000 * 0.15 + 120000 * 0.20 + 350000 * 0.27 + (taxBase - 580000) * 0.35;
    } else {
        incomeTax = 110000 * 0.15 + 120000 * 0.20 + 350000 * 0.27 + 2420000 * 0.35 + (taxBase - 3000000) * 0.40;
    }
    
    // Damga Vergisi (%0.759)
    const stampTax = grossSalary * 0.00759;
    
    // Toplam Kesintiler
    const totalDeductions = sgkEmployee + unemploymentInsurance + incomeTax + stampTax;
    
    // Net Maaş
    const netSalary = grossSalary - totalDeductions;
    
    return {
        netSalary: netSalary,
        deductions: {
            sgk: sgkEmployee,
            unemployment: unemploymentInsurance,
            incomeTax: incomeTax,
            stampTax: stampTax,
            total: totalDeductions
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
    data.steps.forEach(step => {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step-item';
        stepDiv.textContent = step;
        stepsList.appendChild(stepDiv);
    });
    
    // Mevcut kesintiler
    const currentDeductionsDiv = document.getElementById('currentDeductions');
    currentDeductionsDiv.innerHTML = `
        <div class="deduction-item">
            <span>SGK İşçi Payı (%14):</span>
            <span>${formatCurrency(data.currentDeductions.sgk)}</span>
        </div>
        <div class="deduction-item">
            <span>İşsizlik Sigortası (%1):</span>
            <span>${formatCurrency(data.currentDeductions.unemployment)}</span>
        </div>
        <div class="deduction-item">
            <span>Gelir Vergisi:</span>
            <span>${formatCurrency(data.currentDeductions.incomeTax)}</span>
        </div>
        <div class="deduction-item">
            <span>Damga Vergisi (%0.759):</span>
            <span>${formatCurrency(data.currentDeductions.stampTax)}</span>
        </div>
        <div class="deduction-item">
            <span>Toplam Kesinti:</span>
            <span>${formatCurrency(data.currentDeductions.total)}</span>
        </div>
    `;
    
    // Yeni kesintiler
    const newDeductionsDiv = document.getElementById('newDeductions');
    newDeductionsDiv.innerHTML = `
        <div class="deduction-item">
            <span>SGK İşçi Payı (%14):</span>
            <span>${formatCurrency(data.newDeductions.sgk)}</span>
        </div>
        <div class="deduction-item">
            <span>İşsizlik Sigortası (%1):</span>
            <span>${formatCurrency(data.newDeductions.unemployment)}</span>
        </div>
        <div class="deduction-item">
            <span>Gelir Vergisi:</span>
            <span>${formatCurrency(data.newDeductions.incomeTax)}</span>
        </div>
        <div class="deduction-item">
            <span>Damga Vergisi (%0.759):</span>
            <span>${formatCurrency(data.newDeductions.stampTax)}</span>
        </div>
        <div class="deduction-item">
            <span>Toplam Kesinti:</span>
            <span>${formatCurrency(data.newDeductions.total)}</span>
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