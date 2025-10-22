const validateForm = (formData, allRequirementsMet: boolean) => {
  const newErrors: Record<string, string> = {};

  if (formData.firstName.length < 2) {
    newErrors.firstName = "First name must be at least 2 characters";
  }

  if (formData.lastName.length < 2) {
    newErrors.lastName = "Last name must be at least 2 characters";
  }

  if (!validateEmail(formData.email)) {
    newErrors.email = "Please use your FIU email address";
  }

  if (!allRequirementsMet) {
    newErrors.password = "Password does not meet all requirements";
  }

  if (formData.password !== formData.confirmPassword) {
    newErrors.confirmPassword = "Passwords do not match";
  }

  if (!formData.acceptTerms) {
    newErrors.acceptTerms = "You must accept the Terms & Conditions";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

export default validateForm;
