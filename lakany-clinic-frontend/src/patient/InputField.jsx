import React from 'react';

const InputField = ({ icon, placeholder, type = 'text', value, onChange, isArabic }) => (
    <div className="relative group">
      <div className={`absolute inset-y-0 ${isArabic ? 'right-4' : 'left-4'} flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600 text-slate-400`}>
        {icon}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        className={`w-full ${isArabic ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all text-slate-700 placeholder:text-slate-400`}
      />
    </div>
);

export default InputField;