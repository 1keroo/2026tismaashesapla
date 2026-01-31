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
    
    // Net maaş hesaplama (2026 Türkiye vergi sistemi)
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
        monthlyHours: monthlyHours
    });
}

function calculateNetSalary(grossSalary) {
    // 2026 Türkiye vergi ve kesinti oranları
    
    // SGK İşçi Payı (%14)
    const sgkEmployee = grossSalary * 0.14;
    
    // İşsizlik Sigortası İşçi Payı (%1)
    const unemploymentInsurance = grossSalary * 0.01;
    
    // Vergi Matrahı (Brüt - SGK - İşsizlik)
    const taxBase = grossSalary - sgkEmployee - unemploymentInsurance;
    
    // 2026 Gelir Vergisi Dilimleri (Yıllık)
    // Aylık hesaplama için yıllık dilimleri 12'ye böleriz
    const yearlyTaxBase = taxBase * 12;
    
    let yearlyIncomeTax = 0;
    
    // 2026 tahmini vergi dilimleri (2025 rakamları enflasyon ile artırılmış)
    if (yearlyTaxBase <= 150000) {
        yearlyIncomeTax = yearlyTaxBase * 0.15;
    } else if (yearlyTaxBase <= 380000) {
        yearlyIncomeTax = 150000 * 0.15 + (yearlyTaxBase - 150000) * 0.20;
    } else if (yearlyTaxBase <= 900000) {
        yearlyIncomeTax = 150000 * 0.15 + 230000 * 0.20 + (yearlyTaxBase - 380000) * 0.27;
    } else if (yearlyTaxBase <= 4000000) {
        yearlyIncomeTax = 150000 * 0.15 + 230000 * 0.20 + 520000 * 0.27 + (yearlyTaxBase - 900000) * 0.35;
    } else {
        yearlyIncomeTax = 150000 * 0.15 + 230000 * 0.20 + 520000 * 0.27 + 3100000 * 0.35 + (yearlyTaxBase - 4000000) * 0.40;
    }
    
    // Aylık gelir vergisi
    const incomeTax = yearlyIncomeTax / 12;
    
    // Asgari Geçim İndirimi (AGİ) - 2026 tahmini
    // Bekâr için yaklaşık %15 indirim (değişkenlik gösterebilir)
    const AGI = incomeTax * 0.15;
    const incomeTaxAfterAGI = Math.max(0, incomeTax - AGI);
    
    // Damga Vergisi (%0.759)
    const stampTax = grossSalary * 0.00759;
    
    // Toplam Kesintiler
    const totalDeductions = sgkEmployee + unemploymentInsurance + incomeTaxAfterAGI + stampTax;
    
    // Net Maaş
    const netSalary = grossSalary - totalDeductions;
    
    return {
        netSalary: netSalary,
        deductions: {
            sgk: sgkEmployee,
            unemployment: unemploymentInsurance,
            incomeTax: incomeTax,
            agi: AGI,
            incomeTaxAfterAGI: incomeTaxAfterAGI,
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
    
    stepsList.innerHTML += `<div class="step-item"><strong>Başlangıç:</strong> Saat ücreti ${formatCurrency(data.currentWage)} × ${data.monthlyHours} saat = ${formatCurrency(data.currentMonthlyGross)} (Aylık Brüt)</div>`;
    
    data.steps.forEach(step => {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step-item';
        stepDiv.textContent = step;
        stepsList.appendChild(stepDiv);
    });
    
    stepsList.innerHTML += `<div class="step-item"><strong>Sonuç:</strong> Yeni saat ücreti ${formatCurrency(data.newWage)} × ${data.monthlyHours} saat = ${formatCurrency(data.newMonthlyGross)} (Aylık Brüt)</div>`;
    
    // Mevcut kesintiler
    const currentDeductionsDiv = document.getElementById('currentDeductions');
    currentDeductionsDiv.innerHTML = `
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
            <span>Gelir Vergisi (Hesaplanan):</span>
            <span>-${formatCurrency(data.currentDeductions.incomeTax)}</span>
        </div>
        <div class="deduction-item">
            <span>AGİ (Asgari Geçim İndirimi):</span>
            <span style="color: green;">+${formatCurrency(data.currentDeductions.agi)}</span>
        </div>
        <div class="deduction-item">
            <span>Gelir Vergisi (AGİ Sonrası):</span>
            <span>-${formatCurrency(data.currentDeductions.incomeTaxAfterAGI)}</span>
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
    newDeductionsDiv.innerHTML = `
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
            <span>Gelir Vergisi (Hesaplanan):</span>
            <span>-${formatCurrency(data.newDeductions.incomeTax)}</span>
        </div>
        <div class="deduction-item">
            <span>AGİ (Asgari Geçim İndirimi):</span>
            <span style="color: green;">+${formatCurrency(data.newDeductions.agi)}</span>
        </div>
        <div class="deduction-item">
            <span>Gelir Vergisi (AGİ Sonrası):</span>
            <span>-${formatCurrency(data.newDeductions.incomeTaxAfterAGI)}</span>
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
