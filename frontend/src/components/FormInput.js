// src/componens/FormInput.js
import React from 'react';

const FormInput = ({ label, type, name, value, onChange, placeholder }) => {
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input
        type={type}
        id={name}
        name={name}
        className="form-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
      />
    </div>
  );
};

export default FormInput;