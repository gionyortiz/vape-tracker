// Enterprise Reporting & Analytics System
class EnterpriseReporting {
    constructor(app) {
        this.app = app;
        this.reportTypes = {
            sales: 'Sales Reports',
            inventory: 'Inventory Reports',
            financial: 'Financial Reports',
            employee: 'Employee Reports',
            customer: 'Customer Reports',
            tax: 'Tax Reports',
            compliance: 'Compliance Reports'
        };
        this.scheduledReports = [];
        this.loadReportData();
    }

    loadReportData() {
        this.scheduledReports = JSON.parse(localStorage.getItem('vape_scheduled_reports')) || [];
    }

    saveReportData() {
        localStorage.setItem('vape_scheduled_reports', JSON.stringify(this.scheduledReports));
    }

    // Sales Reports
    generateSalesReport(startDate, endDate, options = {}) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        const transactions = this.app.transactions.filter(t => {
            const tDate = new Date(t.date);
            return t.type === 'sale' && tDate >= start && tDate <= end;
        });

        const refunds = this.app.transactions.filter(t => {
            const tDate = new Date(t.date);
            return t.type === 'refund' && tDate >= start && tDate <= end;
        });

        // Basic metrics
        const totalSales = transactions.reduce((sum, t) => sum + t.total, 0);
        const totalRefunds = Math.abs(refunds.reduce((sum, t) => sum + t.total, 0));
        const netSales = totalSales - totalRefunds;
        const averageTransaction = transactions.length > 0 ? totalSales / transactions.length : 0;
        const totalItems = transactions.reduce((sum, t) => sum + t.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0);

        // Payment method breakdown
        const paymentMethods = {};
        transactions.forEach(t => {
            paymentMethods[t.paymentMethod] = (paymentMethods[t.paymentMethod] || 0) + t.total;
        });

        // Hourly sales breakdown
        const hourlySales = {};
        transactions.forEach(t => {
            const hour = new Date(t.date).getHours();
            hourlySales[hour] = (hourlySales[hour] || 0) + t.total;
        });

        // Daily sales breakdown
        const dailySales = {};
        transactions.forEach(t => {
            const day = new Date(t.date).toDateString();
            if (!dailySales[day]) {
                dailySales[day] = { sales: 0, transactions: 0, items: 0 };
            }
            dailySales[day].sales += t.total;
            dailySales[day].transactions++;
            dailySales[day].items += t.items.reduce((sum, item) => sum + item.quantity, 0);
        });

        // Top products
        const productSales = {};
        transactions.forEach(t => {
            t.items.forEach(item => {
                if (!productSales[item.id]) {
                    productSales[item.id] = {
                        name: item.name,
                        quantity: 0,
                        revenue: 0,
                        profit: 0
                    };
                }
                productSales[item.id].quantity += item.quantity;
                productSales[item.id].revenue += item.price * item.quantity;
                
                // Calculate profit (assuming 50% margin for demo)
                const cost = item.price * 0.5;
                productSales[item.id].profit += (item.price - cost) * item.quantity;
            });
        });

        const topProducts = Object.values(productSales)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 20);

        // Category breakdown
        const categoryBreakdown = {};
        transactions.forEach(t => {
            t.items.forEach(item => {
                const product = this.app.products.find(p => p.id === item.id);
                const category = product ? product.category : 'unknown';
                
                if (!categoryBreakdown[category]) {
                    categoryBreakdown[category] = { revenue: 0, quantity: 0 };
                }
                categoryBreakdown[category].revenue += item.price * item.quantity;
                categoryBreakdown[category].quantity += item.quantity;
            });
        });

        // Tax summary
        const totalTax = transactions.reduce((sum, t) => sum + (t.tax || 0), 0);
        const taxByRate = {};
        transactions.forEach(t => {
            const rate = t.tax && t.subtotal ? ((t.tax / t.subtotal) * 100).toFixed(2) + '%' : '0%';
            taxByRate[rate] = (taxByRate[rate] || 0) + (t.tax || 0);
        });

        // Growth analysis (compare to previous period)
        const periodLength = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const prevStart = new Date(start.getTime() - (periodLength * 24 * 60 * 60 * 1000));
        const prevEnd = new Date(start.getTime() - 1);
        
        const prevTransactions = this.app.transactions.filter(t => {
            const tDate = new Date(t.date);
            return t.type === 'sale' && tDate >= prevStart && tDate <= prevEnd;
        });

        const prevSales = prevTransactions.reduce((sum, t) => sum + t.total, 0);
        const growthRate = prevSales > 0 ? ((totalSales - prevSales) / prevSales) * 100 : 0;

        return {
            reportType: 'sales',
            period: { start: startDate, end: endDate },
            summary: {
                totalSales,
                totalRefunds,
                netSales,
                transactionCount: transactions.length,
                refundCount: refunds.length,
                averageTransaction,
                totalItems,
                totalTax,
                growthRate
            },
            breakdown: {
                daily: dailySales,
                hourly: hourlySales,
                paymentMethods,
                categories: categoryBreakdown,
                taxRates: taxByRate
            },
            topProducts,
            trends: this.calculateSalesTrends(transactions),
            comparisons: {
                previousPeriod: {
                    sales: prevSales,
                    transactions: prevTransactions.length,
                    growth: growthRate
                }
            },
            generatedAt: new Date().toISOString(),
            generatedBy: this.app.employeeManager?.currentEmployee?.id || 'system'
        };
    }

    // Inventory Reports
    generateInventoryReport(options = {}) {
        const products = this.app.products;
        const lowStockThreshold = this.app.settings.lowStockThreshold || 10;

        // Current inventory value
        const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
        const totalCost = products.reduce((sum, p) => sum + (p.price * 0.6 * p.stock), 0); // Assume 60% cost ratio
        const totalProfit = totalValue - totalCost;

        // Stock status
        const inStock = products.filter(p => p.stock > lowStockThreshold);
        const lowStock = products.filter(p => p.stock > 0 && p.stock <= lowStockThreshold);
        const outOfStock = products.filter(p => p.stock === 0);

        // Category breakdown
        const categoryBreakdown = {};
        products.forEach(p => {
            if (!categoryBreakdown[p.category]) {
                categoryBreakdown[p.category] = {
                    count: 0,
                    value: 0,
                    stock: 0,
                    lowStock: 0,
                    outOfStock: 0
                };
            }
            const cat = categoryBreakdown[p.category];
            cat.count++;
            cat.value += p.price * p.stock;
            cat.stock += p.stock;
            if (p.stock === 0) cat.outOfStock++;
            else if (p.stock <= lowStockThreshold) cat.lowStock++;
        });

        // Turnover analysis (requires sales data)
        const productTurnover = this.calculateInventoryTurnover(products);

        // ABC Analysis (classify products by revenue)
        const abcAnalysis = this.performABCAnalysis(products);

        // Slow moving items
        const slowMovingItems = this.identifySlowMovingItems(products);

        // Reorder suggestions
        const reorderSuggestions = this.generateReorderSuggestions(products);

        return {
            reportType: 'inventory',
            summary: {
                totalProducts: products.length,
                totalValue,
                totalCost,
                totalProfit,
                profitMargin: totalValue > 0 ? (totalProfit / totalValue) * 100 : 0,
                stockStatus: {
                    inStock: inStock.length,
                    lowStock: lowStock.length,
                    outOfStock: outOfStock.length
                }
            },
            categoryBreakdown,
            stockAlerts: {
                lowStock: lowStock.map(p => ({
                    id: p.id,
                    name: p.name,
                    sku: p.sku,
                    stock: p.stock,
                    threshold: lowStockThreshold
                })),
                outOfStock: outOfStock.map(p => ({
                    id: p.id,
                    name: p.name,
                    sku: p.sku
                }))
            },
            analysis: {
                turnover: productTurnover,
                abc: abcAnalysis,
                slowMoving: slowMovingItems
            },
            recommendations: {
                reorder: reorderSuggestions,
                discontinue: slowMovingItems.filter(item => item.daysSinceLastSale > 90)
            },
            generatedAt: new Date().toISOString()
        };
    }

    // Financial Reports
    generateFinancialReport(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Revenue
        const salesTransactions = this.app.transactions.filter(t => {
            const tDate = new Date(t.date);
            return t.type === 'sale' && tDate >= start && tDate <= end;
        });

        const grossRevenue = salesTransactions.reduce((sum, t) => sum + t.total, 0);
        const totalTax = salesTransactions.reduce((sum, t) => sum + (t.tax || 0), 0);
        const netRevenue = grossRevenue - totalTax;

        // Costs (simplified calculation)
        const costOfGoodsSold = salesTransactions.reduce((sum, t) => {
            return sum + t.items.reduce((itemSum, item) => {
                return itemSum + (item.price * 0.6 * item.quantity); // Assume 60% cost ratio
            }, 0);
        }, 0);

        // Operating expenses (would come from expense tracking system)
        const operatingExpenses = 0; // Placeholder

        // Profit calculations
        const grossProfit = netRevenue - costOfGoodsSold;
        const netProfit = grossProfit - operatingExpenses;

        // Margins
        const grossMargin = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0;
        const netMargin = netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0;

        // Cash flow (simplified)
        const cashFlow = {
            sales: grossRevenue,
            refunds: Math.abs(this.app.transactions
                .filter(t => t.type === 'refund' && new Date(t.date) >= start && new Date(t.date) <= end)
                .reduce((sum, t) => sum + t.total, 0)),
            expenses: operatingExpenses,
            net: grossRevenue - operatingExpenses
        };

        // Profitability by category
        const categoryProfitability = {};
        salesTransactions.forEach(t => {
            t.items.forEach(item => {
                const product = this.app.products.find(p => p.id === item.id);
                const category = product ? product.category : 'unknown';
                
                if (!categoryProfitability[category]) {
                    categoryProfitability[category] = {
                        revenue: 0,
                        cost: 0,
                        profit: 0,
                        margin: 0
                    };
                }
                
                const revenue = item.price * item.quantity;
                const cost = item.price * 0.6 * item.quantity;
                
                categoryProfitability[category].revenue += revenue;
                categoryProfitability[category].cost += cost;
                categoryProfitability[category].profit += (revenue - cost);
            });
        });

        // Calculate margins for each category
        Object.values(categoryProfitability).forEach(cat => {
            cat.margin = cat.revenue > 0 ? (cat.profit / cat.revenue) * 100 : 0;
        });

        return {
            reportType: 'financial',
            period: { start: startDate, end: endDate },
            revenue: {
                gross: grossRevenue,
                net: netRevenue,
                tax: totalTax
            },
            costs: {
                cogs: costOfGoodsSold,
                operating: operatingExpenses,
                total: costOfGoodsSold + operatingExpenses
            },
            profit: {
                gross: grossProfit,
                net: netProfit,
                grossMargin,
                netMargin
            },
            cashFlow,
            categoryProfitability,
            kpis: {
                averageTransactionValue: salesTransactions.length > 0 ? grossRevenue / salesTransactions.length : 0,
                customerAcquisitionCost: 0, // Would need marketing data
                lifetimeValue: 0, // Would need customer data
                inventoryTurnover: this.calculateOverallInventoryTurnover(),
                grossProfitPerDay: grossProfit / Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)))
            },
            generatedAt: new Date().toISOString()
        };
    }

    // Tax Reports
    generateTaxReport(startDate, endDate, taxJurisdiction = 'default') {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const taxableTransactions = this.app.transactions.filter(t => {
            const tDate = new Date(t.date);
            return t.type === 'sale' && tDate >= start && tDate <= end && t.tax > 0;
        });

        // Tax summary by rate
        const taxByRate = {};
        let totalTaxCollected = 0;
        let totalTaxableAmount = 0;

        taxableTransactions.forEach(t => {
            const rate = t.tax && t.subtotal ? ((t.tax / t.subtotal) * 100).toFixed(2) + '%' : '0%';
            
            if (!taxByRate[rate]) {
                taxByRate[rate] = {
                    rate: rate,
                    taxableAmount: 0,
                    taxCollected: 0,
                    transactionCount: 0
                };
            }
            
            taxByRate[rate].taxableAmount += t.subtotal || 0;
            taxByRate[rate].taxCollected += t.tax || 0;
            taxByRate[rate].transactionCount++;
            
            totalTaxCollected += t.tax || 0;
            totalTaxableAmount += t.subtotal || 0;
        });

        // Tax exempt transactions
        const exemptTransactions = this.app.transactions.filter(t => {
            const tDate = new Date(t.date);
            return t.type === 'sale' && tDate >= start && tDate <= end && (t.tax === 0 || !t.tax);
        });

        const exemptAmount = exemptTransactions.reduce((sum, t) => sum + t.total, 0);

        // Daily tax summary
        const dailyTax = {};
        taxableTransactions.forEach(t => {
            const day = new Date(t.date).toDateString();
            if (!dailyTax[day]) {
                dailyTax[day] = {
                    taxableAmount: 0,
                    taxCollected: 0,
                    transactionCount: 0
                };
            }
            dailyTax[day].taxableAmount += t.subtotal || 0;
            dailyTax[day].taxCollected += t.tax || 0;
            dailyTax[day].transactionCount++;
        });

        // Category-wise tax breakdown
        const categoryTax = {};
        taxableTransactions.forEach(t => {
            t.items.forEach(item => {
                const product = this.app.products.find(p => p.id === item.id);
                const category = product ? product.category : 'unknown';
                
                if (!categoryTax[category]) {
                    categoryTax[category] = {
                        taxableAmount: 0,
                        taxCollected: 0
                    };
                }
                
                const itemAmount = item.price * item.quantity;
                const itemTax = (t.tax || 0) * (itemAmount / (t.subtotal || 1));
                
                categoryTax[category].taxableAmount += itemAmount;
                categoryTax[category].taxCollected += itemTax;
            });
        });

        return {
            reportType: 'tax',
            period: { start: startDate, end: endDate },
            jurisdiction: taxJurisdiction,
            summary: {
                totalTaxableAmount,
                totalTaxCollected,
                exemptAmount,
                taxableTransactionCount: taxableTransactions.length,
                exemptTransactionCount: exemptTransactions.length,
                averageTaxRate: totalTaxableAmount > 0 ? (totalTaxCollected / totalTaxableAmount) * 100 : 0
            },
            breakdown: {
                byRate: Object.values(taxByRate),
                byCategory: categoryTax,
                daily: dailyTax
            },
            remittanceData: {
                totalDue: totalTaxCollected,
                dueDate: this.calculateTaxDueDate(endDate),
                filingPeriod: this.getTaxFilingPeriod(startDate, endDate)
            },
            generatedAt: new Date().toISOString(),
            generatedBy: this.app.employeeManager?.currentEmployee?.id || 'system'
        };
    }

    // Employee Performance Reports
    generateEmployeeReport(employeeId, startDate, endDate) {
        if (!this.app.employeeManager) {
            throw new Error('Employee management system not available');
        }

        const employee = this.app.employeeManager.employees.find(emp => emp.id === employeeId);
        if (!employee) {
            throw new Error('Employee not found');
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Sales performance
        const employeeSales = this.app.transactions.filter(t => {
            const tDate = new Date(t.date);
            return t.type === 'sale' && 
                   t.cashier === `${employee.firstName} ${employee.lastName}` &&
                   tDate >= start && 
                   tDate <= end;
        });

        const totalSales = employeeSales.reduce((sum, t) => sum + t.total, 0);
        const averageSale = employeeSales.length > 0 ? totalSales / employeeSales.length : 0;

        // Time tracking
        const timeEntries = this.app.employeeManager.timeEntries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entry.employeeId === employeeId &&
                   entryDate >= start &&
                   entryDate <= end &&
                   entry.clockOut;
        });

        const totalHours = timeEntries.reduce((sum, entry) => sum + entry.totalHours, 0);
        const salesPerHour = totalHours > 0 ? totalSales / totalHours : 0;

        // Commission calculations
        const commissions = (this.app.employeeManager.commissions || []).filter(comm => {
            const commDate = new Date(comm.date);
            return comm.employeeId === employeeId &&
                   commDate >= start &&
                   commDate <= end;
        });

        const totalCommission = commissions.reduce((sum, comm) => sum + comm.commissionAmount, 0);

        // Attendance
        const scheduledDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        const workedDays = timeEntries.length;
        const attendanceRate = scheduledDays > 0 ? (workedDays / scheduledDays) * 100 : 0;

        // Performance metrics
        const performanceScore = this.app.employeeManager.calculatePerformanceRating(employee, employeeSales, totalHours);

        return {
            reportType: 'employee',
            employee: {
                id: employee.id,
                name: `${employee.firstName} ${employee.lastName}`,
                role: employee.role,
                hireDate: employee.hireDate
            },
            period: { start: startDate, end: endDate },
            sales: {
                total: totalSales,
                count: employeeSales.length,
                average: averageSale,
                perHour: salesPerHour
            },
            time: {
                totalHours,
                workedDays,
                averageHoursPerDay: workedDays > 0 ? totalHours / workedDays : 0,
                attendanceRate
            },
            compensation: {
                hourlyRate: employee.hourlyRate,
                regularPay: Math.min(totalHours, 40) * employee.hourlyRate,
                overtimePay: Math.max(totalHours - 40, 0) * employee.hourlyRate * 1.5,
                commission: totalCommission,
                totalEarnings: (Math.min(totalHours, 40) * employee.hourlyRate) + 
                              (Math.max(totalHours - 40, 0) * employee.hourlyRate * 1.5) + 
                              totalCommission
            },
            performance: {
                score: performanceScore,
                ranking: this.getEmployeeRanking(employeeId, startDate, endDate),
                goals: this.getEmployeeGoals(employeeId),
                achievements: this.getEmployeeAchievements(employeeId, startDate, endDate)
            },
            generatedAt: new Date().toISOString()
        };
    }

    // Report Scheduling
    scheduleReport(reportConfig) {
        const scheduledReport = {
            id: this.app.generateId(),
            type: reportConfig.type,
            name: reportConfig.name,
            schedule: reportConfig.schedule, // daily, weekly, monthly
            parameters: reportConfig.parameters,
            recipients: reportConfig.recipients || [],
            format: reportConfig.format || 'json',
            isActive: true,
            nextRun: this.calculateNextRun(reportConfig.schedule),
            createdAt: new Date().toISOString(),
            createdBy: this.app.employeeManager?.currentEmployee?.id || 'system'
        };

        this.scheduledReports.push(scheduledReport);
        this.saveReportData();

        return scheduledReport;
    }

    // Utility methods
    calculateSalesTrends(transactions) {
        const dailyData = {};
        
        transactions.forEach(t => {
            const day = new Date(t.date).toDateString();
            if (!dailyData[day]) {
                dailyData[day] = { sales: 0, transactions: 0 };
            }
            dailyData[day].sales += t.total;
            dailyData[day].transactions++;
        });

        const days = Object.keys(dailyData).sort();
        const trends = {
            direction: 'stable',
            strength: 0,
            pattern: 'normal'
        };

        if (days.length >= 3) {
            const firstThird = days.slice(0, Math.floor(days.length / 3));
            const lastThird = days.slice(-Math.floor(days.length / 3));
            
            const firstAvg = firstThird.reduce((sum, day) => sum + dailyData[day].sales, 0) / firstThird.length;
            const lastAvg = lastThird.reduce((sum, day) => sum + dailyData[day].sales, 0) / lastThird.length;
            
            const change = ((lastAvg - firstAvg) / firstAvg) * 100;
            
            if (change > 5) trends.direction = 'increasing';
            else if (change < -5) trends.direction = 'decreasing';
            
            trends.strength = Math.abs(change);
        }

        return trends;
    }

    calculateInventoryTurnover(products) {
        return products.map(product => {
            // Calculate how many times inventory turned over (simplified)
            const salesThisYear = this.app.transactions
                .filter(t => t.type === 'sale' && new Date(t.date) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000))
                .reduce((sum, t) => {
                    const item = t.items.find(i => i.id === product.id);
                    return sum + (item ? item.quantity : 0);
                }, 0);

            const averageInventory = product.stock + (salesThisYear / 2); // Simplified
            const turnover = averageInventory > 0 ? salesThisYear / averageInventory : 0;

            return {
                productId: product.id,
                name: product.name,
                turnover: turnover,
                category: 'fast' // fast, medium, slow
            };
        });
    }

    performABCAnalysis(products) {
        // Classify products by revenue contribution
        const productRevenues = products.map(product => {
            const revenue = this.app.transactions
                .filter(t => t.type === 'sale')
                .reduce((sum, t) => {
                    const item = t.items.find(i => i.id === product.id);
                    return sum + (item ? item.price * item.quantity : 0);
                }, 0);

            return { ...product, revenue };
        }).sort((a, b) => b.revenue - a.revenue);

        const totalRevenue = productRevenues.reduce((sum, p) => sum + p.revenue, 0);
        let cumulativeRevenue = 0;

        return productRevenues.map(product => {
            cumulativeRevenue += product.revenue;
            const cumulativePercentage = (cumulativeRevenue / totalRevenue) * 100;

            let classification = 'C';
            if (cumulativePercentage <= 80) classification = 'A';
            else if (cumulativePercentage <= 95) classification = 'B';

            return {
                productId: product.id,
                name: product.name,
                revenue: product.revenue,
                classification,
                cumulativePercentage
            };
        });
    }

    identifySlowMovingItems(products) {
        return products.map(product => {
            const lastSale = this.app.transactions
                .filter(t => t.type === 'sale' && t.items.some(i => i.id === product.id))
                .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

            const daysSinceLastSale = lastSale 
                ? Math.floor((Date.now() - new Date(lastSale.date)) / (1000 * 60 * 60 * 24))
                : 999;

            return {
                productId: product.id,
                name: product.name,
                daysSinceLastSale,
                currentStock: product.stock,
                category: product.category,
                isSlow: daysSinceLastSale > 30
            };
        }).filter(item => item.isSlow);
    }

    generateReorderSuggestions(products) {
        return products
            .filter(p => p.stock <= this.app.settings.lowStockThreshold)
            .map(product => {
                // Calculate suggested reorder quantity based on sales velocity
                const salesLast30Days = this.app.transactions
                    .filter(t => {
                        const tDate = new Date(t.date);
                        return t.type === 'sale' && 
                               tDate >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                    })
                    .reduce((sum, t) => {
                        const item = t.items.find(i => i.id === product.id);
                        return sum + (item ? item.quantity : 0);
                    }, 0);

                const dailyVelocity = salesLast30Days / 30;
                const suggestedQuantity = Math.max(Math.ceil(dailyVelocity * 30), 10); // 30-day supply

                return {
                    productId: product.id,
                    name: product.name,
                    currentStock: product.stock,
                    dailyVelocity,
                    suggestedQuantity,
                    urgency: product.stock === 0 ? 'critical' : 'high'
                };
            });
    }

    calculateOverallInventoryTurnover() {
        const totalCost = this.app.products.reduce((sum, p) => sum + (p.price * 0.6 * p.stock), 0);
        const cogs = this.app.transactions
            .filter(t => t.type === 'sale' && new Date(t.date) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000))
            .reduce((sum, t) => sum + t.items.reduce((itemSum, item) => itemSum + (item.price * 0.6 * item.quantity), 0), 0);

        return totalCost > 0 ? cogs / totalCost : 0;
    }

    calculateTaxDueDate(endDate) {
        // Calculate next tax due date (simplified - varies by jurisdiction)
        const date = new Date(endDate);
        date.setMonth(date.getMonth() + 1);
        date.setDate(15); // Assume 15th of following month
        return date.toISOString();
    }

    getTaxFilingPeriod(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        if (start.getMonth() === end.getMonth()) {
            return `${start.toLocaleString('default', { month: 'long', year: 'numeric' })}`;
        } else {
            return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
        }
    }

    calculateNextRun(schedule) {
        const now = new Date();
        const next = new Date(now);

        switch (schedule) {
            case 'daily':
                next.setDate(next.getDate() + 1);
                break;
            case 'weekly':
                next.setDate(next.getDate() + 7);
                break;
            case 'monthly':
                next.setMonth(next.getMonth() + 1);
                break;
        }

        return next.toISOString();
    }

    getEmployeeRanking(employeeId, startDate, endDate) {
        // Simplified ranking calculation
        return Math.floor(Math.random() * 10) + 1; // Demo ranking
    }

    getEmployeeGoals(employeeId) {
        // Return employee goals (would be stored in employee data)
        return [
            { type: 'sales', target: 10000, current: 8500, period: 'monthly' },
            { type: 'customer_satisfaction', target: 95, current: 92, period: 'monthly' }
        ];
    }

    getEmployeeAchievements(employeeId, startDate, endDate) {
        // Return achievements for the period
        return [
            { name: 'Top Seller', description: 'Highest sales this month', earnedDate: new Date().toISOString() }
        ];
    }

    // Export reports
    exportReport(report, format = 'json') {
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `${report.reportType}-report-${timestamp}.${format}`;

        switch (format) {
            case 'json':
                this.app.dataManager.downloadJSON(report, filename);
                break;
            case 'csv':
                const csv = this.convertReportToCSV(report);
                this.app.dataManager.downloadCSV(csv, filename);
                break;
            case 'pdf':
                this.generatePDFReport(report, filename);
                break;
        }
    }

    convertReportToCSV(report) {
        // Convert report data to CSV format based on report type
        let csv = '';
        
        switch (report.reportType) {
            case 'sales':
                csv = this.salesReportToCSV(report);
                break;
            case 'inventory':
                csv = this.inventoryReportToCSV(report);
                break;
            // Add other report types...
        }
        
        return csv;
    }

    salesReportToCSV(report) {
        const headers = ['Date', 'Total Sales', 'Transactions', 'Average Sale', 'Items Sold'];
        const rows = Object.entries(report.breakdown.daily).map(([date, data]) => [
            date,
            data.sales.toFixed(2),
            data.transactions,
            (data.sales / data.transactions).toFixed(2),
            data.items
        ]);

        return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    }

    inventoryReportToCSV(report) {
        const headers = ['Product ID', 'Name', 'Category', 'Stock', 'Value', 'Status'];
        // Implementation would depend on available data structure
        return headers.join(',');
    }

    generatePDFReport(report, filename) {
        // PDF generation would require a library like jsPDF
        console.log('PDF generation not implemented in demo');
        alert('PDF export feature would be implemented with a PDF library');
    }
}

// Add to main app
document.addEventListener('DOMContentLoaded', () => {
    if (window.vapeTracker) {
        window.vapeTracker.reporting = new EnterpriseReporting(window.vapeTracker);
        console.log('Enterprise reporting system initialized');
    }
});