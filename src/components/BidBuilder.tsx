import React, { useState, useEffect } from 'react';
import { Calculator, FileText, AlertTriangle, CheckCircle, Users, MapPin, Wrench, DollarSign, Waves, AlertCircle, Info } from 'lucide-react';

const BidBuilder = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Pool Type Selection
    poolConstructionType: 'fiberglass',
    
    // Client Information
    clientName: '',
    clientAddress: '',
    clientPhone: '',
    
    // Agent Information
    agentName: 'Chad Taylor',
    agentTitle: 'President Of Sales',
    agentCell: '423-321-4260',
    agentEmail: 'Chad@ingroundpooldesign.com',
    
    // Site Assessment
    siteAssessment: {
      access: '',
      soilType: '',
      drainage: '',
      utilities: '',
      slope: ''
    },
    
    // Pool Configuration
    poolOptionA: {
      shape: '',
      size: '',
      depth: '',
      basePrice: 0
    },
    poolOptionB: {
      shape: '',
      size: '',
      depth: '',
      basePrice: 0
    },
    selectedOption: 'A',
    
    // Additional Options
    spa: { included: false, price: 8500 },
    saltSystem: { included: false, price: 1200 },
    electricalWork: { included: false, price: 2500 },
    colorLogicLights: { included: false, price: 1800 },
    electricHeatPump: { included: false, price: 4500 },
    gasPropaneHeater: { included: false, price: 3200 },
    crystalColorUpgrade: { included: false, price: 1500 },
    
    // Custom Options
    customOption1: { description: '', price: 0 },
    customOption2: { description: '', price: 0 },
    customOption3: { description: '', price: 0 },
    customOption4: { description: '', price: 0 },
    customOption5: { description: '', price: 0 },
    
    // Other
    patioWork: 0,
    references: ['', '', ''],
    notes: ''
  });
  
  const [pricing, setPricing] = useState({
    basePoolPrice: 0,
    siteAdjustments: 0,
    additionalOptionsTotal: 0,
    totalPoolCost: 0,
    patioWork: 0,
    totalProjectCost: 0
  });
  
  const [riskAssessment, setRiskAssessment] = useState({
    overall: 'green',
    risks: []
  });
  
  const [paymentSchedule, setPaymentSchedule] = useState({
    deposit10: 0,
    deposit40: 0,
    payment30: 0,
    final20: 0
  });
  
  const [warnings, setWarnings] = useState([]);
  const [showBidSheet, setShowBidSheet] = useState(false);

  // Pricing data
  const fiberglassPricing = {
    shapes: {
      'rectangle': { name: 'Rectangle', baseMultiplier: 1.0, complexity: 'green' },
      'kidney': { name: 'Kidney', baseMultiplier: 1.08, complexity: 'green' },
      'figure-8': { name: 'Figure 8', baseMultiplier: 1.15, complexity: 'yellow' },
      'freeform': { name: 'Freeform/Lagoon', baseMultiplier: 1.20, complexity: 'yellow' },
      'custom': { name: 'Custom Shape', baseMultiplier: 1.35, complexity: 'red' }
    },
    sizes: {
      'small-12x24': { name: 'Small (12\' x 24\')', basePrice: 38000, complexity: 'green' },
      'medium-14x28': { name: 'Medium (14\' x 28\')', basePrice: 42000, complexity: 'green' },
      'large-16x32': { name: 'Large (16\' x 32\')', basePrice: 48000, complexity: 'green' },
      'xl-18x36': { name: 'Extra Large (18\' x 36\')', basePrice: 55000, complexity: 'yellow' },
      'xxl-20x40': { name: 'XX Large (20\' x 40\')', basePrice: 65000, complexity: 'yellow' }
    },
    depths: {
      'shallow': { name: 'Shallow (3\'-5\')', modifier: 0, complexity: 'green' },
      'standard': { name: 'Standard (3\'-6\')', modifier: 1500, complexity: 'green' },
      'deep': { name: 'Deep (3\'-8\')', modifier: 3500, complexity: 'yellow' },
      'diving': { name: 'Diving (3\'-9\')', modifier: 6500, complexity: 'red' }
    }
  };

  // Risk factors
  const riskFactors = {
    access: {
      'easy': { risk: 'green', costImpact: 0, description: 'Standard equipment access' },
      'moderate': { risk: 'yellow', costImpact: 2500, description: 'Some access challenges' },
      'difficult': { risk: 'red', costImpact: 7500, description: 'Crane or hand-dig required' },
      'crane-required': { risk: 'red', costImpact: 15000, description: 'Crane access mandatory' }
    },
    soilType: {
      'normal': { risk: 'green', costImpact: 0, description: 'Standard excavation' },
      'clay': { risk: 'yellow', costImpact: 3000, description: 'Clay soil challenges' },
      'rock': { risk: 'red', costImpact: 8000, description: 'Rock removal required' },
      'sandy': { risk: 'yellow', costImpact: 2000, description: 'Excavation stabilization' },
      'unknown': { risk: 'red', costImpact: 0, description: 'Soil test required before pricing' }
    },
    drainage: {
      'good': { risk: 'green', costImpact: 0, description: 'No drainage concerns' },
      'poor': { risk: 'yellow', costImpact: 3500, description: 'Drainage system needed' },
      'standing-water': { risk: 'red', costImpact: 8500, description: 'Major drainage work required' }
    },
    utilities: {
      'clear': { risk: 'green', costImpact: 0, description: 'No utility conflicts' },
      'minor-conflicts': { risk: 'yellow', costImpact: 2000, description: 'Minor utility relocation' },
      'major-relocation': { risk: 'red', costImpact: 8000, description: 'Major utility work required' }
    },
    slope: {
      'level': { risk: 'green', costImpact: 0, description: 'Level ground' },
      'slight': { risk: 'green', costImpact: 1500, description: 'Minor grading' },
      'steep': { risk: 'yellow', costImpact: 5000, description: 'Retaining walls may be needed' },
      'terraced': { risk: 'red', costImpact: 12000, description: 'Major earthwork required' }
    }
  };

  useEffect(() => {
    calculatePricing();
    assessRisk();
  }, [formData]);

  const calculatePricing = () => {
    const selectedOption = formData.selectedOption;
    const poolOptionKey = 'poolOption' + selectedOption;
    const poolData = formData[poolOptionKey];
    
    if (!poolData.shape || !poolData.size || !poolData.depth) {
      setPricing(prev => ({ ...prev, totalPoolCost: 0, totalProjectCost: 0 }));
      return;
    }

    const sizeData = fiberglassPricing.sizes[poolData.size];
    const shapeData = fiberglassPricing.shapes[poolData.shape];
    const depthData = fiberglassPricing.depths[poolData.depth];
    
    const basePrice = (sizeData?.basePrice || 0) * (shapeData?.baseMultiplier || 1) + (depthData?.modifier || 0);
    
    let siteAdjustments = 0;
    Object.keys(formData.siteAssessment).forEach(factor => {
      const value = formData.siteAssessment[factor];
      if (value && riskFactors[factor] && riskFactors[factor][value]) {
        siteAdjustments += riskFactors[factor][value].costImpact;
      }
    });
    
    let additionalTotal = 0;
    ['spa', 'saltSystem', 'electricalWork', 'colorLogicLights', 'electricHeatPump', 'gasPropaneHeater', 'crystalColorUpgrade'].forEach(option => {
      if (formData[option]?.included) {
        additionalTotal += formData[option].price || 0;
      }
    });
    
    for (let i = 1; i <= 5; i++) {
      const customOptionKey = 'customOption' + i;
      additionalTotal += (formData[customOptionKey].price || 0);
    }
    
    const totalPoolCost = basePrice + siteAdjustments + additionalTotal;
    const totalProjectCost = totalPoolCost + (formData.patioWork || 0);
    
    setPricing({
      basePoolPrice: basePrice,
      siteAdjustments,
      additionalOptionsTotal: additionalTotal,
      totalPoolCost,
      patioWork: formData.patioWork || 0,
      totalProjectCost
    });
    
    setPaymentSchedule({
      deposit10: Math.round(totalPoolCost * 0.10),
      deposit40: Math.round(totalPoolCost * 0.40),
      payment30: Math.round(totalPoolCost * 0.30),
      final20: Math.round(totalPoolCost * 0.20)
    });

    setFormData(prev => ({
      ...prev,
      [poolOptionKey]: {
        ...prev[poolOptionKey],
        basePrice: basePrice + siteAdjustments
      }
    }));
  };

  const assessRisk = () => {
    const risks = [];
    const riskLevels = [];
    
    Object.keys(formData.siteAssessment).forEach(factor => {
      const value = formData.siteAssessment[factor];
      if (value && riskFactors[factor] && riskFactors[factor][value]) {
        const riskData = riskFactors[factor][value];
        riskLevels.push(riskData.risk);
        
        if (riskData.risk === 'yellow' || riskData.risk === 'red') {
          risks.push({
            factor: factor.replace(/([A-Z])/g, ' $1').toLowerCase(),
            level: riskData.risk,
            description: riskData.description,
            costImpact: riskData.costImpact
          });
        }
      }
    });
    
    const selectedOption = formData.selectedOption;
    const poolOptionKey = 'poolOption' + selectedOption;
    const poolData = formData[poolOptionKey];
    
    if (poolData.shape && fiberglassPricing.shapes[poolData.shape].complexity !== 'green') {
      risks.push({
        factor: 'pool shape',
        level: fiberglassPricing.shapes[poolData.shape].complexity,
        description: 'Complex shape may require special handling',
        costImpact: 0
      });
      riskLevels.push(fiberglassPricing.shapes[poolData.shape].complexity);
    }
    
    if (poolData.size && fiberglassPricing.sizes[poolData.size].complexity !== 'green') {
      risks.push({
        factor: 'pool size',
        level: fiberglassPricing.sizes[poolData.size].complexity,
        description: 'Large pools require special equipment',
        costImpact: 0
      });
      riskLevels.push(fiberglassPricing.sizes[poolData.size].complexity);
    }
    
    let overallRisk = 'green';
    if (riskLevels.includes('red')) overallRisk = 'red';
    else if (riskLevels.includes('yellow')) overallRisk = 'yellow';
    
    setRiskAssessment({
      overall: overallRisk,
      risks: risks
    });
    
    const newWarnings = [];
    if (overallRisk === 'red') {
      newWarnings.push('High-risk project - requires management review before quoting');
    }
    if (overallRisk === 'yellow') {
      newWarnings.push('Moderate risk - verify site conditions before final pricing');
    }
    if (formData.gasPropaneHeater?.included) {
      newWarnings.push('Gas heater selected - customer responsible for gas connections');
    }
    if (pricing.totalPoolCost > 80000) {
      newWarnings.push('High-value project - confirm insurance coverage limits');
    }
    setWarnings(newWarnings);
  };

  const handleInputChange = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleAdditionalOptionChange = (option, included, customPrice = null) => {
    setFormData(prev => ({
      ...prev,
      [option]: {
        included,
        price: customPrice !== null ? customPrice : prev[option].price
      }
    }));
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'green': return 'text-green-600 bg-green-50 border-green-200';
      case 'yellow': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'red': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'green': return CheckCircle;
      case 'yellow': return AlertTriangle;
      case 'red': return AlertCircle;
      default: return Info;
    }
  };

  const generateBidSheet = () => {
    setShowBidSheet(true);
  };

  const steps = [
    { number: 1, title: 'Site Assessment', icon: MapPin },
    { number: 2, title: 'Client & Agent Info', icon: Users },
    { number: 3, title: 'Pool Configuration', icon: Waves },
    { number: 4, title: 'Additional Options', icon: Wrench },
    { number: 5, title: 'Review & Generate', icon: FileText }
  ];

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Pool Construction Type</h3>
              <div className="p-3 bg-blue-100 rounded-lg">
                <div className="flex items-center">
                  <Waves className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-800">Fiberglass Pool Selected</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  Latham fiberglass pools with lifetime warranty, Crystite gelcoat system
                </p>
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Site Assessment (Critical for Accurate Pricing)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Site Access</label>
                  <select
                    value={formData.siteAssessment.access}
                    onChange={(e) => handleInputChange('siteAssessment', 'access', e.target.value)}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="">Select access level</option>
                    <option value="easy">Easy - Standard equipment access</option>
                    <option value="moderate">Moderate - Some challenges (+$2,500)</option>
                    <option value="difficult">Difficult - Hand dig/special equipment (+$7,500)</option>
                    <option value="crane-required">Crane Required (+$15,000)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Soil Type</label>
                  <select
                    value={formData.siteAssessment.soilType}
                    onChange={(e) => handleInputChange('siteAssessment', 'soilType', e.target.value)}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="">Select soil type</option>
                    <option value="normal">Normal Soil</option>
                    <option value="clay">Clay Soil (+$3,000)</option>
                    <option value="rock">Rock/Ledge (+$8,000)</option>
                    <option value="sandy">Sandy Soil (+$2,000)</option>
                    <option value="unknown">Unknown - Soil Test Required</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Drainage</label>
                  <select
                    value={formData.siteAssessment.drainage}
                    onChange={(e) => handleInputChange('siteAssessment', 'drainage', e.target.value)}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="">Select drainage condition</option>
                    <option value="good">Good Drainage</option>
                    <option value="poor">Poor Drainage (+$3,500)</option>
                    <option value="standing-water">Standing Water Issues (+$8,500)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Utilities</label>
                  <select
                    value={formData.siteAssessment.utilities}
                    onChange={(e) => handleInputChange('siteAssessment', 'utilities', e.target.value)}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="">Select utility situation</option>
                    <option value="clear">Clear of Utilities</option>
                    <option value="minor-conflicts">Minor Utility Conflicts (+$2,000)</option>
                    <option value="major-relocation">Major Utility Relocation (+$8,000)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Site Slope</label>
                  <select
                    value={formData.siteAssessment.slope}
                    onChange={(e) => handleInputChange('siteAssessment', 'slope', e.target.value)}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="">Select slope condition</option>
                    <option value="level">Level Ground</option>
                    <option value="slight">Slight Slope (+$1,500)</option>
                    <option value="steep">Steep Slope (+$5,000)</option>
                    <option value="terraced">Requires Terracing (+$12,000)</option>
                  </select>
                </div>
              </div>
            </div>
            
            {riskAssessment.risks.length > 0 && (
              <div className={`p-4 rounded-lg border ${getRiskColor(riskAssessment.overall)}`}>
                <div className="flex items-center mb-3">
                  {React.createElement(getRiskIcon(riskAssessment.overall), { className: 'w-5 h-5 mr-2' })}
                  <span className="font-semibold">
                    Site Risk Assessment: {riskAssessment.overall.toUpperCase()}
                  </span>
                </div>
                <ul className="space-y-2">
                  {riskAssessment.risks.map((risk, index) => (
                    <li key={index} className="text-sm">
                      <span className="font-medium capitalize">{risk.factor}:</span> {risk.description}
                      {risk.costImpact > 0 && (
                        <span className="ml-2 font-semibold">+${risk.costImpact.toLocaleString()}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Client Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Client Name</label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => handleInputChange(null, 'clientName', e.target.value)}
                    className="w-full p-3 border rounded-lg"
                    placeholder="Enter client name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <input
                    type="text"
                    value={formData.clientPhone}
                    onChange={(e) => handleInputChange(null, 'clientPhone', e.target.value)}
                    className="w-full p-3 border rounded-lg"
                    placeholder="Client phone number"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Client Address</label>
                <textarea
                  value={formData.clientAddress}
                  onChange={(e) => handleInputChange(null, 'clientAddress', e.target.value)}
                  className="w-full p-3 border rounded-lg"
                  rows="2"
                  placeholder="Full client address"
                />
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">IPD Agent Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Agent Name</label>
                  <input
                    type="text"
                    value={formData.agentName}
                    onChange={(e) => handleInputChange(null, 'agentName', e.target.value)}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.agentTitle}
                    onChange={(e) => handleInputChange(null, 'agentTitle', e.target.value)}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Cell Phone</label>
                  <input
                    type="text"
                    value={formData.agentCell}
                    onChange={(e) => handleInputChange(null, 'agentCell', e.target.value)}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.agentEmail}
                    onChange={(e) => handleInputChange(null, 'agentEmail', e.target.value)}
                    className="w-full p-3 border rounded-lg"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">References</h3>
              <div className="space-y-2">
                {[0, 1, 2].map(index => (
                  <input
                    key={index}
                    type="text"
                    value={formData.references[index]}
                    onChange={(e) => {
                      const newRefs = [...formData.references];
                      newRefs[index] = e.target.value;
                      handleInputChange(null, 'references', newRefs);
                    }}
                    className="w-full p-3 border rounded-lg"
                    placeholder={`Reference ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Fiberglass Pool Configuration</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Configure Both Options for Client Comparison</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="A"
                      checked={formData.selectedOption === 'A'}
                      onChange={(e) => handleInputChange(null, 'selectedOption', e.target.value)}
                      className="mr-2"
                    />
                    Primary Option A
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="B"
                      checked={formData.selectedOption === 'B'}
                      onChange={(e) => handleInputChange(null, 'selectedOption', e.target.value)}
                      className="mr-2"
                    />
                    Alternative Option B
                  </label>
                </div>
              </div>
            </div>
            
            {['A', 'B'].map(option => {
              const poolOptionKey = 'poolOption' + option;
              const isSelected = formData.selectedOption === option;
              return (
                <div key={option} className={`p-4 rounded-lg border-2 ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <h4 className="font-semibold mb-3">Pool Option {option}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Shape</label>
                      <select
                        value={formData[poolOptionKey].shape}
                        onChange={(e) => handleInputChange(poolOptionKey, 'shape', e.target.value)}
                        className="w-full p-3 border rounded-lg"
                      >
                        <option value="">Select shape</option>
                        {Object.entries(fiberglassPricing.shapes).map(([key, data]) => (
                          <option key={key} value={key}>
                            {data.name} {data.complexity !== 'green' && `(${data.complexity.toUpperCase()})`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Size</label>
                      <select
                        value={formData[poolOptionKey].size}
                        onChange={(e) => handleInputChange(poolOptionKey, 'size', e.target.value)}
                        className="w-full p-3 border rounded-lg"
                      >
                        <option value="">Select size</option>
                        {Object.entries(fiberglassPricing.sizes).map(([key, data]) => (
                          <option key={key} value={key}>
                            {data.name} - ${data.basePrice.toLocaleString()}
                            {data.complexity !== 'green' && ` (${data.complexity.toUpperCase()})`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Depth</label>
                      <select
                        value={formData[poolOptionKey].depth}
                        onChange={(e) => handleInputChange(poolOptionKey, 'depth', e.target.value)}
                        className="w-full p-3 border rounded-lg"
                      >
                        <option value="">Select depth</option>
                        {Object.entries(fiberglassPricing.depths).map(([key, data]) => (
                          <option key={key} value={key}>
                            {data.name} {data.modifier > 0 && `(+$${data.modifier.toLocaleString()})`}
                            {data.complexity !== 'green' && ` (${data.complexity.toUpperCase()})`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {isSelected && formData[poolOptionKey].shape && (
                    <div className="mt-3 p-3 bg-green-100 rounded-lg">
                      <div className="font-semibold text-green-800">
                        Calculated Base Price: ${formData[poolOptionKey].basePrice.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Included Fiberglass Pool Features</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>• High-rate pump (Hayward)</div>
                <div>• Upgraded plumbing package</div>
                <div>• High-rate sand filter with backwash valve</div>
                <div>• Multiport valve to control hydraulic flow</div>
                <div>• Rigid Schedule 40 plumbing (330psi)</div>
                <div>• Skimmer to clean pool's surface</div>
                <div>• High pressure return jets</div>
                <div>• Polymer filter pad</div>
                <div>• Handrail and ladder</div>
                <div>• Rope and floats</div>
                <div>• Complete maintenance equipment kit</div>
                <div>• Latham Lifetime Warranty on structure</div>
                <div>• Crystite Gelcoat System</div>
                <div>• Ceramic Filler, Carbon Fiber, Kevlar</div>
              </div>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <h3 className="font-semibold text-lg">Additional Options & Upgrades</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'spa', name: 'Spa', price: 8500 },
                { key: 'saltSystem', name: 'Salt System', price: 1200 },
                { key: 'electricalWork', name: 'Electrical Work', price: 2500 },
                { key: 'colorLogicLights', name: 'Color Logic Lights', price: 1800 },
                { key: 'electricHeatPump', name: 'Electric Heat Pump', price: 4500 },
                { key: 'gasPropaneHeater', name: 'Gas Propane Heater*', price: 3200 },
                { key: 'crystalColorUpgrade', name: 'Crystal Color Upgrade', price: 1500 }
              ].map(({ key, name, price }) => (
                <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData[key]?.included || false}
                      onChange={(e) => handleAdditionalOptionChange(key, e.target.checked)}
                      className="mr-3"
                    />
                    <span className="font-medium">{name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">$</span>
                    <input
                      type="number"
                      value={formData[key]?.price || price}
                      onChange={(e) => handleAdditionalOptionChange(key, formData[key]?.included || false, parseInt(e.target.value) || 0)}
                      className="w-24 p-2 border rounded text-right"
                      disabled={!formData[key]?.included}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {formData.gasPropaneHeater?.included && (
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                <p className="text-sm text-yellow-800">
                  *Owner shall be responsible for making gas connections
                </p>
              </div>
            )}
            
            <div>
              <h4 className="font-semibold mb-3">Custom Additional Options</h4>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(num => {
                  const customOptionKey = 'customOption' + num;
                  return (
                    <div key={num} className="flex gap-3">
                      <input
                        type="text"
                        value={formData[customOptionKey].description}
                        onChange={(e) => handleInputChange(customOptionKey, 'description', e.target.value)}
                        className="flex-1 p-3 border rounded-lg"
                        placeholder={`Custom option ${num} description`}
                      />
                      <div className="flex items-center">
                        <span className="mr-2">$</span>
                        <input
                          type="number"
                          value={formData[customOptionKey].price || ''}
                          onChange={(e) => handleInputChange(customOptionKey, 'price', parseInt(e.target.value) || 0)}
                          className="w-32 p-3 border rounded-lg text-right"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Patio Work (Separate Contract)</label>
              <input
                type="number"
                value={formData.patioWork || ''}
                onChange={(e) => handleInputChange(null, 'patioWork', parseInt(e.target.value) || 0)}
                className="w-full p-3 border rounded-lg"
                placeholder="Patio cost (separate from pool payment schedule)"
              />
            </div>
          </div>
        );
      
      case 5:
        return (
          <div className="space-y-6">
            <div className={`p-4 rounded-lg border ${getRiskColor(riskAssessment.overall)}`}>
              <div className="flex items-center mb-3">
                {React.createElement(getRiskIcon(riskAssessment.overall), { className: 'w-5 h-5 mr-2' })}
                <span className="font-semibold text-lg">
                  Project Risk Assessment: {riskAssessment.overall.toUpperCase()}
                </span>
              </div>
              {riskAssessment.risks.length > 0 ? (
                <ul className="space-y-1">
                  {riskAssessment.risks.map((risk, index) => (
                    <li key={index} className="text-sm">
                      <span className="font-medium capitalize">{risk.factor}:</span> {risk.description}
                      {risk.costImpact > 0 && (
                        <span className="ml-2 font-semibold">+${risk.costImpact.toLocaleString()}</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm">No significant risk factors identified.</p>
              )}
            </div>

            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-4">Fiberglass Pool Cost Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Base Pool Price (Option {formData.selectedOption}):</span>
                  <span className="font-semibold">${pricing.basePoolPrice.toLocaleString()}</span>
                </div>
                {pricing.siteAdjustments > 0 && (
                  <div className="flex justify-between">
                    <span>Site Condition Adjustments:</span>
                    <span className="font-semibold">${pricing.siteAdjustments.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Additional Options:</span>
                  <span className="font-semibold">${pricing.additionalOptionsTotal.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>Total Pool Cost:</span>
                  <span className="text-green-600">${pricing.totalPoolCost.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-4">Fiberglass Pool Payment Schedule</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>1. Deposit for Permitting (10%):</span>
                  <span className="font-semibold">${paymentSchedule.deposit10.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>2. Deposit to secure fiberglass shell order (40%):</span>
                  <span className="font-semibold">${paymentSchedule.deposit40.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>3. After excavation of pool site (30%):</span>
                  <span className="font-semibold">${paymentSchedule.payment30.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>4. Upon pool installed and operational (20%):</span>
                  <span className="font-semibold">${paymentSchedule.final20.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            {pricing.patioWork > 0 && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Additional Project Costs</h4>
                <div className="flex justify-between">
                  <span>Patio Work (Separate Contract):</span>
                  <span className="font-semibold">${pricing.patioWork.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between text-lg font-bold">
                  <span>Total Project Cost:</span>
                  <span className="text-blue-600">${pricing.totalProjectCost.toLocaleString()}</span>
                </div>
                <p className="text-xs mt-2 text-yellow-700">
                  Patio is not included in the above payment schedule. The patio is a separate contract made with the Patio Contractor and will be paid to them directly.
                </p>
              </div>
            )}
            
            {warnings.length > 0 && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="font-medium">Important Alerts</span>
                </div>
                <ul className="text-sm text-red-700 space-y-1">
                  {warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex gap-4">
              <button
                onClick={generateBidSheet}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 flex items-center justify-center"
                disabled={pricing.totalPoolCost === 0}
              >
                <FileText className="w-5 h-5 mr-2" />
                Generate Professional Bid Sheet
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (showBidSheet) {
    const selectedPoolKey = 'poolOption' + formData.selectedOption;
    const selectedPool = formData[selectedPoolKey];
    const today = new Date();
    const validThru = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white">
        <div className="flex justify-between items-start mb-6">
          <div className="text-center">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-800 to-blue-600 rounded-full flex items-center justify-center mb-4">
              <div className="text-white text-xs font-bold text-center leading-tight">
                INGROUND<br/>POOL<br/>DESIGN<br/>
                <div className="text-xs mt-1">ESTABLISHED 2003</div>
              </div>
            </div>
            <div className="text-xs">@ingroundpooldesign www.ingroundpooldesign.com</div>
          </div>
          
          <div className="bg-blue-800 text-white p-4 rounded-lg flex-1 max-w-md ml-6">
            <h3 className="font-bold mb-4 text-center">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <strong>Client Information</strong>
                <div>Name: {formData.clientName}</div>
                <div>Address: {formData.clientAddress}</div>
                <div>Phone #: {formData.clientPhone}</div>
              </div>
              <div>
                <strong>IPD Agent Information</strong>
                <div>Name: {formData.agentName}</div>
                <div>Title: {formData.agentTitle}</div>
                <div>Cell: {formData.agentCell}</div>
                <div>Email: {formData.agentEmail}</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
              <div>Bid Date: {today.toLocaleDateString()}</div>
              <div>Valid Thru: {validThru.toLocaleDateString()}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-800 text-white p-4 rounded-lg mb-6">
          <h3 className="font-bold text-center mb-4">Base Pool Price Includes</h3>
          <div className="grid grid-cols-3 gap-6 text-xs">
            <div>
              <strong>Pool Equipment</strong>
              <ul className="mt-2 space-y-1">
                <li>• High-rate pump</li>
                <li>• Upgraded plumbing package</li>
                <li>• High-rate sand filter with backwash valve</li>
                <li>• Multiport valve to control hydraulic flow</li>
                <li>• Rigid Schedule 40 plumbing (330psi)</li>
                <li>• Skimmer to clean pool's surface</li>
                <li>• High pressure return jets</li>
                <li>• Polymer filter pad</li>
              </ul>
            </div>
            <div>
              <strong>Pool Structure</strong>
              <ul className="mt-2 space-y-1">
                <li>• Latham Fiberglass Pools are built to APSP and ICC Standards.</li>
                <li>• Latham offers a "Lifetime Warranty" on the pool structure and surface.</li>
                <li>• Latham uses multi step "Crystite" Gelcoat System. Latham also incorporates a Ceramic Filler, Carbon Fiber, Kevlar and White pigment in their resins during the production of their fiberglass pools.</li>
              </ul>
            </div>
            <div>
              <strong>Pool Features</strong>
              <ul className="mt-2 space-y-1">
                <li>• Handrail provided for entry point.</li>
                <li>• Ladder provided for exit point</li>
                <li>• Rope and floats provided</li>
                <li>• Maintenance equipment including telescoping pole, hose, vac head, vac adapter, net, brush, and test kit</li>
                <li>• Operating instructions available on our website</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
            <div>
              <strong>Option A:</strong> Shape: {selectedPool.shape && fiberglassPricing.shapes[selectedPool.shape]?.name} 
              Size: {selectedPool.size && fiberglassPricing.sizes[selectedPool.size]?.name} 
              Depth: {selectedPool.depth && fiberglassPricing.depths[selectedPool.depth]?.name}
            </div>
            <div>
              <strong>Option B:</strong> Shape: {formData.poolOptionB.shape && fiberglassPricing.shapes[formData.poolOptionB.shape]?.name} 
              Size: {formData.poolOptionB.size && fiberglassPricing.sizes[formData.poolOptionB.size]?.name} 
              Depth: {formData.poolOptionB.depth && fiberglassPricing.depths[formData.poolOptionB.depth]?.name}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-blue-800 text-white p-4 rounded-lg">
            <h3 className="font-bold text-center mb-4">Pool Costs</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Base Pool Price Option A</span>
                <span>${formData.poolOptionA.basePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Base Pool Price Option B</span>
                <span>${formData.poolOptionB.basePrice.toLocaleString()}</span>
              </div>
              <hr className="my-2" />
              {formData.spa.included && (
                <div className="flex justify-between">
                  <span>Spa</span>
                  <span>${formData.spa.price.toLocaleString()}</span>
                </div>
              )}
              {formData.saltSystem.included && (
                <div className="flex justify-between">
                  <span>Salt System</span>
                  <span>${formData.saltSystem.price.toLocaleString()}</span>
                </div>
              )}
              {formData.electricalWork.included && (
                <div className="flex justify-between">
                  <span>Electrical Work</span>
                  <span>${formData.electricalWork.price.toLocaleString()}</span>
                </div>
              )}
              {formData.colorLogicLights.included && (
                <div className="flex justify-between">
                  <span>Color Logic Lights</span>
                  <span>${formData.colorLogicLights.price.toLocaleString()}</span>
                </div>
              )}
              {formData.electricHeatPump.included && (
                <div className="flex justify-between">
                  <span>Electric Heat Pump</span>
                  <span>${formData.electricHeatPump.price.toLocaleString()}</span>
                </div>
              )}
              {formData.gasPropaneHeater.included && (
                <div className="flex justify-between">
                  <span>Gas Propane Heater*</span>
                  <span>${formData.gasPropaneHeater.price.toLocaleString()}</span>
                </div>
              )}
              {formData.crystalColorUpgrade.included && (
                <div className="flex justify-between">
                  <span>Crystal Color Upgrade</span>
                  <span>${formData.crystalColorUpgrade.price.toLocaleString()}</span>
                </div>
              )}
              
              {[1, 2, 3, 4, 5].map(num => {
                const customOptionKey = 'customOption' + num;
                return formData[customOptionKey].description && (
                  <div key={num} className="flex justify-between">
                    <span>{formData[customOptionKey].description}</span>
                    <span>${formData[customOptionKey].price.toLocaleString()}</span>
                  </div>
                );
              })}
              
              <hr className="my-2" />
              <div className="flex justify-between font-bold">
                <span>Total Pool Cost*</span>
                <span>${pricing.totalPoolCost.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-800 text-white p-4 rounded-lg">
              <h3 className="font-bold text-center mb-4">Additional Options Continued</h3>
              <div className="space-y-8 text-sm">
                <div className="border-b border-white pb-1"></div>
                <div className="border-b border-white pb-1"></div>
                <div className="border-b border-white pb-1"></div>
                <div className="border-b border-white pb-1"></div>
                <div className="border-b border-white pb-1"></div>
                
                <div className="mt-8">
                  <div className="flex justify-between font-bold">
                    <span>TOTAL PROJECT COST</span>
                    <span>${pricing.totalProjectCost.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-800 text-white p-4 rounded-lg">
              <h3 className="font-bold text-center mb-4">Pool Payment Schedule</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>1. Deposit for Permitting</span>
                  <span>10% ${paymentSchedule.deposit10.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>2. Deposit to secure fiberglass shell order</span>
                  <span>40% ${paymentSchedule.deposit40.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>3. After excavation of pool site</span>
                  <span>30% ${paymentSchedule.payment30.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>4. Upon pool installed and operational</span>
                  <span>20% ${paymentSchedule.final20.toLocaleString()}</span>
                </div>
              </div>
              <p className="text-xs mt-4">
                Please note that the above payment schedule is for the Total Pool Cost* only. 
                Patio is not included in the above draws. The patio is a separate contract made 
                with the Patio Contractor and will be paid to them directly.
              </p>
            </div>

            <div className="bg-blue-800 text-white p-4 rounded-lg">
              <h3 className="font-bold text-center mb-4">References</h3>
              <div className="space-y-2 text-sm">
                {formData.references.map((ref, index) => (
                  <div key={index} className="border-b border-white pb-1">
                    {index + 1}. {ref}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-xs">
          <div className="mb-2">
            Tennessee Contractor's License #64513<br/>
            Alabama Contractor's License #48795<br/>
            $1 Million General Liability Insurance Policy
          </div>
          <div>
            Scan the QR code for more information and photos!
          </div>
        </div>
        
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => setShowBidSheet(false)}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Back to Edit
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Print/Save PDF
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-800">BidBuilder - Fiberglass Pools</h1>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              ${pricing.totalPoolCost.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Current Bid Total</div>
            {riskAssessment.overall !== 'green' && (
              <div className={`text-xs px-2 py-1 rounded mt-1 ${getRiskColor(riskAssessment.overall)}`}>
                {riskAssessment.overall.toUpperCase()} RISK
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= step.number ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                {currentStep > step.number ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  React.createElement(step.icon, { className: 'w-5 h-5' })
                )}
              </div>
              <span className={`ml-2 text-sm ${currentStep >= step.number ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-8 h-0.5 mx-4 ${currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
        
        <div className="mb-8">
          {renderStep()}
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className={`px-6 py-2 rounded-lg ${currentStep === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Previous
          </button>
          
          <button
            onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
            disabled={currentStep === 5}
            className={`px-6 py-2 rounded-lg ${currentStep === 5 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
          >
            Next
          </button>
        </div>
        
        {pricing.totalPoolCost > 0 && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <DollarSign className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-800">
                Live fiberglass pool pricing: ${pricing.totalPoolCost.toLocaleString()}
                {warnings.length > 0 && (
                  <span className="ml-2 text-red-600">
                    ({warnings.length} alert{warnings.length > 1 ? 's' : ''})
                  </span>
                )}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BidBuilder;