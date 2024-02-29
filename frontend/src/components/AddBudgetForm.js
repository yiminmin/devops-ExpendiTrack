import React, { useState, useEffect } from 'react';
import { useBudgetContext } from '../contexts/BudgetContext';
import { useUserContext } from '../contexts/UserContext';
import {calculateTotalSpent, formatCurrency} from "../helpers/HelperFunctions";
import { useExpenseContext } from '../contexts/ExpenseContext';
import BasicModal from "./Modal";
import {useTranslation} from "react-i18next";


const AddBudgetForm = ({ existingBudget = null, onClose }) => {
    const [budgetDescription, setBudgetDescription] = useState('');
    const{t} = useTranslation("global");
    const [budgetAmount, setBudgetAmount] = useState('');
    const { addNewBudget, updateExistingBudget, fetchBudgets, setError, error, resetError } = useBudgetContext();
    const { user } = useUserContext();
    const { expenses, fetchExpenses } = useExpenseContext() || { expenses: [] }; // Fallback to default if context is undefined

    const [showWarningModal, setShowWarningModal] = useState(false);

    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    // Adjusted to include resetError call on close
    const enhancedOnClose = () => {
        setError('');
        resetError(); // Clear any existing errors
        if (typeof onClose === 'function') {
            onClose(); // Call the original onClose prop if it's a function
        }
    };

    // Function to reset the form fields
    const resetFormFields = () => {
        setBudgetDescription('');
        setBudgetAmount('');
    };

    // Populate form when existingBudget is provided
    useEffect(() => {
        if (existingBudget) {
            setBudgetDescription(existingBudget.budgetDescription);
            setBudgetAmount(existingBudget.budgetAmount);
        }
    }, [existingBudget, onClose]);

    const handleWarningClose = async (proceed) => {
        setShowWarningModal(false);
        resetError(); // Also reset errors when closing the warning modal
        if (proceed) {
            await submitBudget();
        }
    };

    const submitBudget = async () => {
        const budgetData = { budgetDescription, budgetAmount: parseFloat(budgetAmount), user: { id: user.id } };
        try {
            if (existingBudget) {
                await updateExistingBudget(existingBudget.budgetId, budgetData);
                await fetchBudgets(user.id); // Refresh the budget list
                await fetchExpenses(user.id); // Refresh expenses to reflect any changes from the budget update
            } else {
                await addNewBudget(budgetData);
                await fetchBudgets(user.id); // Refresh the budget list for new additions
            }
            resetFormFields(); // Reset the form fields on successful submission
            setShowSuccessAlert(true);
            setTimeout(() => setShowSuccessAlert(false), 5000); // Show success message
        } catch (serverError) {
            setError(serverError.message);
            resetError();
            resetFormFields(); // Reset the form fields on successful submission

        }
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        resetError();

        if (!budgetDescription || isNaN(parseFloat(budgetAmount))) {
            alert(t("app.add-budget-alert"));
            return;
        }

        if (existingBudget) {
            const totalSpent = calculateTotalSpent(expenses, existingBudget.budgetId);
            if (parseFloat(budgetAmount) < totalSpent) {
                setShowWarningModal(true);
                return;
            }
        }

        await submitBudget();
    };

    return (
        <div className="dashboard-budget-form ">
            <form onSubmit={handleSubmit}>
                <section className="panel panel-primary">
                    <header className="panel-heading">
                        <h2 className="panel-title">{existingBudget ? 'Edit Budget' : t("app.add-budget-create-budget-title")}</h2>
                    </header>
                    <div className="form-section-container">
                        <div className="form-group mrgn-tp-sm">

                            <label htmlFor="budget-description">
                                <span className="field-name">{t("app.add-budget-budget-name")}</span> <strong
                                className="required">{t("app.add-budget-required")}</strong>
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                value={budgetDescription}
                                onChange={(e) => setBudgetDescription(e.target.value)}
                                onInvalid={(e) => e.target.setCustomValidity(t("app.budgetNameRequired"))}
                                onInput={(e) => e.target.setCustomValidity('')}
                                placeholder="e.g., Groceries"
                                id="budget-description"
                                data-testid="budget-description-input"
                                required
                            />
                        </div>
                        <div className="form-group">

                            <label htmlFor="budget-amount">
                                <span className="field-name">{t("app.add-budget-amount")}</span> <strong
                                className="required">{t("app.add-budget-required")}</strong>
                            </label>

                            <input
                                type="number"
                                className="form-control"
                                value={budgetAmount}
                                onChange={(e) => setBudgetAmount(e.target.value)}
                                onInvalid={(e) => e.target.setCustomValidity(t("app.budgetAmountRequired"))}
                                onInput={(e) => e.target.setCustomValidity('')}
                                placeholder="e.g., 500"
                                id="budget-amount"
                                data-testid="budget-amount-input"
                                required
                            />
                        </div>
                        {existingBudget ? (
                            <button type="submit" className="btn-lg btn-success">
                                <span className="glyphicon glyphicon-floppy-save"></span>
                                &nbsp; {t("app.budgetItem-edit")}
                            </button>
                        ) : (
                            <div className="mrgn-bttm-md">
                                <button type="submit" className="btn-lg btn-default">
                                    <span className="glyphicon glyphicon-plus"></span>
                                    &nbsp;{t("app.add-budget-create-budget-title")}
                                </button>
                            </div>
                        )}

                        {error && (
                            <div className="alert alert-danger" role="alert">
                                <h4>{t("app.budgetItem-the-form-cannot-be-submitted")}</h4>
                                <ul>
                                    <li>{error}</li>
                                </ul>
                            </div>
                        )}
                        {
                            showSuccessAlert && !error && (
                                <div className="alert alert-success" role="alert">
                                    <button type="button" className="close" data-dismiss="alert" aria-label="Close" onClick={() => setShowSuccessAlert(false)}>
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                    <p>{t("app.add-budget-successfully")} {existingBudget ? t("app.add-budget-updated") : t("app.add-budget-added")}! </p>
                                </div>
                            )
                        }

                        <BasicModal
                            show={showWarningModal}
                            handleClose={enhancedOnClose}
                            title="Warning"
                        >
                            <p><strong>{`{t("app.add-budget-warning-1")} ${formatCurrency(parseFloat(budgetAmount))} {t("app.add-budget-warning-2")} ${formatCurrency(calculateTotalSpent(expenses, existingBudget?.budgetId))}. {t("app.add-budget-warning-3")}`}</strong></p>
                            <div>
                                <button onClick={() => handleWarningClose(true)} className="btn btn-danger mrgn-rght-lg">{t("app.add-expenses-proceed")}
                                </button>
                                <button onClick={() => handleWarningClose(false)} className="btn btn-default">{t("app.budgetItem-cancel")}
                                </button>
                            </div>

                        </BasicModal>

                    </div>
                </section>
            </form>
        </div>
    );
};

export default AddBudgetForm;
