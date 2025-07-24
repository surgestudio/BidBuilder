import React, { useState, useEffect } from 'react';
import { Calculator, FileText, AlertTriangle, CheckCircle, Users, MapPin, Wrench, DollarSign, Waves, AlertCircle, Info, Database, Wifi, WifiOff } from 'lucide-react';

const BidBuilder = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [lastSync, setLastSync] = useState(null);
  
  // Airtable Configuration - Using test credentials
  const AIRTABLE_CONFIG = {
    BASE_ID: 'apph2UVivGEhT51wj',
    ACCESS_TOKEN: 'pathCVnFPdPAPMZec.95cd398e404cb4ea2383b18313f3ad11e5f8eab7f5337876d89e0d1dc1c0ab2e',
    BASE_URL: 'https://api.airtable.com/v0'
  };
  
  const [formData, setFormData] = useState({
    poolConstructionType: 'fiberglass',
    clientName: '',
    clientAddress: '',
    clientPhone: '',
    agentName: 'Chad Taylor',
    agentTitle: 'President Of Sales',
    agentCell: '423-321-4260',
    agentEmail: 'Chad@ingroundpooldesign.com',
    siteAssessment: {
      access: '',
      soilType: '',
      drainage: '',
      utilities: '',
      slope: ''
    },
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
    additionalOptions: {},
    customOption1: { description: '', price: 0 },
    customOption2: { description: '', price: 0 },
    customOption3: { description: '', price: 0 },
    customOption4: { description: '', price: 0 },
    customOption5: { description: '', price: 0 },
    patioWork: 0,
    references: ['', '', ''],
    notes: ''
  });
  
  // Dynamic data from Airtable
  const [airtableData, setAirtableData] = useState({
    poolBasePricing: [],
    poolDepthOptions: [],
    additionalOptions: [],
    siteRiskFactors: [],
    paymentSchedules: []
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

  // Fetch data from Airtable with rate limiting
  const fetchAirtableData = async () => {
    console.log('🔄 Starting Airtable fetch with rate limiting...');
    console.log('Base ID:', AIRTABLE_CONFIG.BASE_ID);

    setIsLoading(true);
    try {
      const headers = {
        'Authorization': `Bearer ${AIRTABLE_CONFIG.ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      };

      console.log('📡 Making sequential API calls to avoid rate limits...');

      // Helper function to add delay between requests
      const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

      // Fetch data sequentially with delays to avoid rate limiting
      console.log('📊 Fetching Pool Base Pricing...');
      const poolBasePricingRes = await fetch(`${AIRTABLE_CONFIG.BASE_URL}/${AIRTABLE_CONFIG.BASE_ID}/Pool_Base_Pricing?maxRecords=100`, { headers });
      await delay(300); // 300ms delay between requests

      console.log('📊 Fetching Pool Depth Options...');
      const poolDepthOptionsRes = await fetch(`${AIRTABLE_CONFIG.BASE_URL}/${AIRTABLE_CONFIG.BASE_ID}/Pool_Depth_Options?maxRecords=100`, { headers });
      await delay(300);

      console.log('📊 Fetching Additional Options...');
      const additionalOptionsRes = await fetch(`${AIRTABLE_CONFIG.BASE_URL}/${AIRTABLE_CONFIG.BASE_ID}/Additional_Options?maxRecords=100`, { headers });
      await delay(300);

      console.log('📊 Fetching Site Risk Factors...');
      const siteRiskFactorsRes = await fetch(`${AIRTABLE_CONFIG.BASE_URL}/${AIRTABLE_CONFIG.BASE_ID}/Site_Risk_Factors?maxRecords=100`, { headers });
      await delay(300);

      console.log('📊 Fetching Payment Schedules...');
      const paymentSchedulesRes = await fetch(`${AIRTABLE_CONFIG.BASE_URL}/${AIRTABLE_CONFIG.BASE_ID}/Payment_Schedules?maxRecords=100`, { headers });

      // Check if any requests failed
      const responses = [poolBasePricingRes, poolDepthOptionsRes, additionalOptionsRes, siteRiskFactorsRes, paymentSchedulesRes];
      const statuses = responses.map(res => res.status);
      console.log('📊 All response statuses:', statuses);

      if (responses.some(res => !res.ok)) {
        const failedResponse = responses.find(res => !res.ok);
        const errorText = await failedResponse.text();
        console.error('❌ API Error:', failedResponse.status, errorText);
        
        if (failedResponse.status === 429) {
          throw new Error(`Rate limit exceeded. Please wait a moment and try again. Status: ${failedResponse.status}`);
        } else {
          throw new Error(`API Error: ${failedResponse.status} - ${errorText}`);
        }
      }

      // Parse responses
      const [
        poolBasePricing,
        poolDepthOptions,
        additionalOptions,
        siteRiskFactors,
        paymentSchedules
      ] = await Promise.all([
        poolBasePricingRes.json(),
        poolDepthOptionsRes.json(),
        additionalOptionsRes.json(),
        siteRiskFactorsRes.json(),
        paymentSchedulesRes.json()
      ]);

      console.log('📦 Data loaded successfully:', {
        poolBasePricing: poolBasePricing.records?.length || 0,
        poolDepthOptions: poolDepthOptions.records?.length || 0,
        additionalOptions: additionalOptions.records?.length || 0,
        siteRiskFactors: siteRiskFactors.records?.length || 0,
        paymentSchedules: paymentSchedules.records?.length || 0
      });

      // Filter data for Fiberglass pools
      const fiberglassPoolPricing = poolBasePricing.records?.filter(record => 
        record.fields.construction_type === 'Fiberglass' && record.fields.active === true
      ) || [];

      const fiberglassDepthOptions = poolDepthOptions.records?.filter(record =>
        record.fields.construction_type === 'Fiberglass' && record.fields.active === true
      ) || [];

      const fiberglassAdditionalOptions = additionalOptions.records?.filter(record =>
        record.fields.active === true && 
        record.fields.applicable_types?.includes('Fiberglass')
      ) || [];

      const fiberglassSiteRiskFactors = siteRiskFactors.records?.filter(record =>
        record.fields.active === true &&
        record.fields.applies_to_types?.includes('Fiberglass')
      ) || [];

      const fiberglassPaymentSchedules = paymentSchedules.records?.filter(record =>
        record.fields.construction_type === 'Fiberglass' && record.fields.active === true
      ) || [];

      setAirtableData({
        poolBasePricing: fiberglassPoolPricing,
        poolDepthOptions: fiberglassDepthOptions,
        additionalOptions: fiberglassAdditionalOptions,
        siteRiskFactors: fiberglassSiteRiskFactors,
        paymentSchedules: fiberglassPaymentSchedules
      });

      setLastSync(new Date());
      setIsOnline(true);
      console.log('✅ Successfully loaded and filtered data from Airtable');
    } catch (error) {
      console.error('❌ Error fetching Airtable data:', error.message);
      setIsOnline(false);
      // Use fallback data if API fails
      console.log('🔄 Loading fallback data due to API error...');
      loadFallbackData();
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback data if Airtable is unavailable
  const loadFallbackData = () => {
    setAirtableData({
      poolBasePricing: [
        { id: 'fallback1', fields: { shape: 'Rectangle', size_category: 'Medium (14x28)', base_price: 42000, shape_multiplier: 1.0, complexity_level: 'Green' }},
        { id: 'fallback2', fields: { shape: 'Kidney', size_category: 'Medium (14x28)', base_price: 42000, shape_multiplier: 1.08, complexity_level: 'Green' }}
      ],
      poolDepthOptions: [
        { id: 'depth1', fields: { depth_option: 'Standard (3\'-6\')', price_modifier: 1500, complexity_level: 'Green' }},
        { id: 'depth2', fields: { depth_option: 'Deep (3\'-8\')', price_modifier: 3500, complexity_level: 'Yellow' }}
      ],
      additionalOptions: [
        { id: 'opt1', fields: { option_name: 'Spa', price: 8500, complexity_level: 'Yellow' }},
        { id: 'opt2', fields: { option_name: 'Salt System', price: 1200, complexity_level: 'Green' }}
      ],
      siteRiskFactors: [
        { id: 'risk1', fields: { factor_category: 'Access', condition_level: 'Easy', risk_level: 'Green', cost_adjustment: 0, description: 'Standard access' }},
        { id: 'risk2', fields: { factor_category: 'Access', condition_level: 'Difficult', risk_level: 'Red', cost_adjustment: 7500, description: 'Difficult access' }}
      ],
      paymentSchedules: [
        { id: 'pay1', fields: { milestone_1_percent: 10, milestone_2_percent: 40, milestone_3_percent: 30, milestone_4_percent: 20 }}
      ]
    });
  };

  // Initialize data on component mount
  useEffect(() => {
    fetchAirtableData();
  }, []);

  // Recalculate pricing when form data or Airtable data changes
  useEffect(() => {
    if (airtableData.poolBasePricing.length > 0) {
      calculatePricing();
      assessRisk();
    }
  }, [formData, airtableData]);

  const calculatePricing = () => {
    const selectedOption = formData.selectedOption;
    const poolOptionKey = 'poolOption' + selectedOption;
    const poolData = formData[poolOptionKey];
    
    if (!poolData.shape || !poolData.size || !poolData.depth) {
      setPricing(prev => ({ ...prev, totalPoolCost: 0, totalProjectCost: 0 }));
      return;
    }

    // Find matching base price from Airtable data
    const basePoolRecord = airtableData.poolBasePricing.find(record => 
      record.fields.shape === poolData.shape && 
      record.fields.size_category === poolData.size
    );

    // Find depth modifier from Airtable data  
    const depthRecord = airtableData.poolDepthOptions.find(record =>
      record.fields.depth_option === poolData.depth
    );

    if (!basePoolRecord || !depthRecord) {
      console.warn('❌ Could not find matching pricing data');
      return;
    }

    const basePrice = (basePoolRecord.fields.base_price || 0) * 
                     (basePoolRecord.fields.shape_multiplier || 1) + 
                     (depthRecord.fields.price_modifier || 0);
    
    // Calculate site adjustments using Airtable data
    let siteAdjustments = 0;
    Object.keys(formData.siteAssessment).forEach(factor => {
      const value = formData.siteAssessment[factor];
      if (value) {
        const riskRecord = airtableData.siteRiskFactors.find(record =>
          record.fields.factor_category.toLowerCase() === factor.toLowerCase() &&
          record.fields.condition_level === value
        );
        if (riskRecord) {
          siteAdjustments += riskRecord.fields.cost_adjustment || 0;
        }
      }
    });
    
    // Calculate additional options using Airtable data
    let additionalTotal = 0;
    Object.keys(formData.additionalOptions).forEach(optionId => {
      if (formData.additionalOptions[optionId]?.included) {
        const optionRecord = airtableData.additionalOptions.find(record => record.id === optionId);
        if (optionRecord) {
          additionalTotal += formData.additionalOptions[optionId].price || optionRecord.fields.price || 0;
        }
      }
    });
    
    // Add custom options
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
    
    // Calculate payment schedule using Airtable data
    const paymentRecord = airtableData.paymentSchedules[0]; // Fiberglass schedule
    if (paymentRecord) {
      setPaymentSchedule({
        deposit10: Math.round(totalPoolCost * (paymentRecord.fields.milestone_1_percent / 100)),
        deposit40: Math.round(totalPoolCost * (paymentRecord.fields.milestone_2_percent / 100)),
        payment30: Math.round(totalPoolCost * (paymentRecord.fields.milestone_3_percent / 100)),
        final20: Math.round(totalPoolCost * (paymentRecord.fields.milestone_4_percent / 100))
      });
    }

    // Update selected pool option price
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
    
    // Assess site factors using Airtable data
    Object.keys(formData.siteAssessment).forEach(factor => {
      const value = formData.siteAssessment[factor];
      if (value) {
        const riskRecord = airtableData.siteRiskFactors.find(record =>
          record.fields.factor_category.toLowerCase() === factor.toLowerCase() &&
          record.fields.condition_level === value
        );
        if (riskRecord) {
          riskLevels.push(riskRecord.fields.risk_level);
          if (riskRecord.fields.risk_level !== 'Green') {
            risks.push({
              factor: factor,
              level: riskRecord.fields.risk_level.toLowerCase(),
              description: riskRecord.fields.description,
              costImpact: riskRecord.fields.cost_adjustment
            });
          }
        }
      }
    });
    
    // Check pool configuration complexity
    const selectedOption = formData.selectedOption;
    const poolOptionKey = 'poolOption' + selectedOption;
    const poolData = formData[poolOptionKey];
    
    if (poolData.shape && poolData.size) {
      const basePoolRecord = airtableData.poolBasePricing.find(record => 
        record.fields.shape === poolData.shape && 
        record.fields.size_category === poolData.size
      );
      if (basePoolRecord && basePoolRecord.fields.complexity_level !== 'Green') {
        risks.push({
          factor: 'pool configuration',
          level: basePoolRecord.fields.complexity_level.toLowerCase(),
          description: 'Complex pool configuration may require special handling',
          costImpact: 0
        });
        riskLevels.push(basePoolRecord.fields.complexity_level);
      }
    }
    
    // Determine overall risk
    let overallRisk = 'green';
    if (riskLevels.includes('Red')) overallRisk = 'red';
    else if (riskLevels.includes('Yellow')) overallRisk = 'yellow';
    
    setRiskAssessment({
      overall: overallRisk,
      risks: risks
    });
    
    // Generate warnings
    const newWarnings = [];
    if (overallRisk === 'red') {
      newWarnings.push('High-risk project - requires management review before quoting');
    }
    if (overallRisk === 'yellow') {
      newWarnings.push('Moderate risk - verify site conditions before final pricing');
    }
    
    // Check for gas heater warning
    const gasHeaterSelected = Object.keys(formData.additionalOptions).some(optionId => {
      const option = formData.additionalOptions[optionId];
      if (option?.included) {
        const optionRecord = airtableData.additionalOptions.find(record => record.id === optionId);
        return optionRecord?.fields.requires_gas_connection;
      }
      return false;
    });
    
    if (gasHeaterSelected) {
      newWarnings.push('Gas heater selected - customer responsible for gas connections');
    }
    
    if (pricing.totalPoolCost > 80000) {
      newWarnings.push('High-value project - confirm insurance coverage limits');
    }
    
    setWarnings(newWarnings);
  };

  // Save quote to Airtable
  const saveQuoteToAirtable = async () => {
    if (!isOnline) {
      alert('Cannot save quote - not connected to database');
      return;
    }

    try {
      const quoteData = {
        fields: {
          client_name: formData.clientName,
          client_address: formData.clientAddress,
          client_phone: formData.clientPhone,
          agent_name: formData.agentName,
          agent_email: formData.agentEmail,
          construction_type: formData.poolConstructionType,
          // selected_option: formData.selectedOption,
          pool_configuration: JSON.stringify(formData[`poolOption${formData.selectedOption}`]),
          base_price: pricing.basePoolPrice,
          site_adjustments: pricing.siteAdjustments,
          additional_options: pricing.additionalOptionsTotal,
          total_pool_cost: pricing.totalPoolCost,
          patio_cost: pricing.patioWork,
          total_project_cost: pricing.totalProjectCost,
          risk_level: riskAssessment.overall.charAt(0).toUpperCase() + riskAssessment.overall.slice(1),
          status: 'Draft',
          notes: formData.notes
        }
      };

      const response = await fetch(`${AIRTABLE_CONFIG.BASE_URL}/${AIRTABLE_CONFIG.BASE_ID}/Generated_Quotes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_CONFIG.ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(quoteData)
      });

      if (response.ok) {
        alert('✅ Quote saved successfully to database!');
      } else {
        throw new Error('Failed to save quote');
      }
    } catch (error) {
      console.error('❌ Error saving quote:', error);
      alert('❌ Error saving quote to database');
    }
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

  const handleAdditionalOptionChange = (optionId, included, customPrice = null) => {
    setFormData(prev => ({
      ...prev,
      additionalOptions: {
        ...prev.additionalOptions,
        [optionId]: {
          included,
          price: customPrice
        }
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

  // Get unique values from Airtable data
  const getUniqueShapes = () => {
    const shapes = new Set();
    airtableData.poolBasePricing.forEach(record => {
      if (record.fields.shape) shapes.add(record.fields.shape);
    });
    return Array.from(shapes);
  };

  const getUniqueSizes = () => {
    const sizes = new Set();
    airtableData.poolBasePricing.forEach(record => {
      if (record.fields.size_category) sizes.add(record.fields.size_category);
    });
    return Array.from(sizes);
  };

  const getUniqueDepths = () => {
    const depths = new Set();
    airtableData.poolDepthOptions.forEach(record => {
      if (record.fields.depth_option) depths.add(record.fields.depth_option);
    });
    return Array.from(depths);
  };

  const getSiteConditions = (category) => {
    const conditions = new Set();
    airtableData.siteRiskFactors
      .filter(record => record.fields.factor_category.toLowerCase() === category.toLowerCase())
      .forEach(record => {
        if (record.fields.condition_level) conditions.add(record.fields.condition_level);
      });
    return Array.from(conditions);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Database className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-semibold mb-2">Loading Pricing Data...</h2>
          <p className="text-gray-600">Connecting to Airtable database</p>
        </div>
      </div>
    );
  }

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
                  <div className="ml-auto flex items-center">
                    {isOnline ? (
                      <Wifi className="w-4 h-4 text-green-600 mr-1" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-red-600 mr-1" />
                    )}
                    <span className={`text-xs ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                      {isOnline ? 'Live Pricing' : 'Offline Mode'}
                    </span>
                  </div>
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
                    {getSiteConditions('Access').map(condition => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
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
                    {getSiteConditions('Soil').map(condition => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
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
                    {getSiteConditions('Drainage').map(condition => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
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
                    {getSiteConditions('Utilities').map(condition => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
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
                    {getSiteConditions('Slope').map(condition => (
                      <option key={condition} value={condition}>{condition}</option>
                    ))}
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
                        {getUniqueShapes().map(shape => (
                          <option key={shape} value={shape}>{shape}</option>
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
                        {getUniqueSizes().map(size => {
                          const priceRecord = airtableData.poolBasePricing.find(record => 
                            record.fields.size_category === size && record.fields.shape === 'Rectangle'
                          );
                          return (
                            <option key={size} value={size}>
                              {size} - ${priceRecord ? priceRecord.fields.base_price.toLocaleString() : 'N/A'}
                            </option>
                          );
                        })}
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
                        {getUniqueDepths().map(depth => {
                          const depthRecord = airtableData.poolDepthOptions.find(record => 
                            record.fields.depth_option === depth
                          );
                          return (
                            <option key={depth} value={depth}>
                              {depth} {depthRecord && depthRecord.fields.price_modifier > 0 && `(+${depthRecord.fields.price_modifier.toLocaleString()})`}
                            </option>
                          );
                        })}
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
              {airtableData.additionalOptions.map(record => (
                <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.additionalOptions[record.id]?.included || false}
                      onChange={(e) => handleAdditionalOptionChange(record.id, e.target.checked)}
                      className="mr-3"
                    />
                    <div>
                      <span className="font-medium">{record.fields.option_name}</span>
                      {record.fields.requires_gas_connection && (
                        <span className="text-yellow-600 text-xs ml-1">*</span>
                      )}
                      {record.fields.complexity_level !== 'Green' && (
                        <div className={`text-xs px-2 py-1 rounded mt-1 inline-block ml-2 ${getRiskColor(record.fields.complexity_level.toLowerCase())}`}>
                          {record.fields.complexity_level.toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">$</span>
                    <input
                      type="number"
                      value={formData.additionalOptions[record.id]?.price || record.fields.price}
                      onChange={(e) => handleAdditionalOptionChange(record.id, formData.additionalOptions[record.id]?.included || false, parseInt(e.target.value) || 0)}
                      className="w-24 p-2 border rounded text-right"
                      disabled={!formData.additionalOptions[record.id]?.included}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {Object.keys(formData.additionalOptions).some(optionId => {
              const option = formData.additionalOptions[optionId];
              if (option?.included) {
                const optionRecord = airtableData.additionalOptions.find(record => record.id === optionId);
                return optionRecord?.fields.requires_gas_connection;
              }
              return false;
            }) && (
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
            {/* Database Status */}
            <div className={`p-4 rounded-lg border ${isOnline ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <div className="flex items-center mb-2">
                <Database className="w-5 h-5 mr-2" />
                <span className="font-semibold">
                  Database Status: {isOnline ? 'Connected' : 'Offline Mode'}
                </span>
                {lastSync && (
                  <span className="ml-auto text-xs text-gray-500">
                    Last sync: {lastSync.toLocaleTimeString()}
                  </span>
                )}
              </div>
              <p className={`text-sm ${isOnline ? 'text-green-700' : 'text-yellow-700'}`}>
                {isOnline 
                  ? 'Pricing data loaded from Airtable. Quotes can be saved to database.'
                  : 'Using cached data. Connect to internet to sync with live pricing and save quotes.'
                }
              </p>
            </div>

            {/* Risk Assessment */}
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

            {/* Pricing Summary */}
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
            
            {/* Payment Schedule */}
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
            
            {/* Project Cost */}
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
            
            {/* Warnings */}
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
            
            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={generateBidSheet}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 flex items-center justify-center"
                disabled={pricing.totalPoolCost === 0}
              >
                <FileText className="w-5 h-5 mr-2" />
                Generate Professional Bid Sheet
              </button>
              <button
                onClick={saveQuoteToAirtable}
                className={`flex-1 py-3 px-6 rounded-lg flex items-center justify-center ${
                  isOnline 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!isOnline || pricing.totalPoolCost === 0}
              >
                <Database className="w-5 h-5 mr-2" />
                {isOnline ? 'Save Quote to Database' : 'Database Unavailable'}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Simplified bid sheet for now - full implementation would be similar to before
  if (showBidSheet) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Professional Pool Installation Bid</h1>
          <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
          <div className="mt-4 flex items-center justify-center">
            {isOnline ? (
              <div className="flex items-center text-green-600">
                <Database className="w-4 h-4 mr-1" />
                <span className="text-sm">Live pricing from database</span>
              </div>
            ) : (
              <div className="flex items-center text-yellow-600">
                <WifiOff className="w-4 h-4 mr-1" />
                <span className="text-sm">Generated in offline mode</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-2">Client Information</h3>
              <p>{formData.clientName}</p>
              <p>{formData.clientAddress}</p>
              <p>{formData.clientPhone}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Agent Information</h3>
              <p>{formData.agentName}</p>
              <p>{formData.agentTitle}</p>
              <p>{formData.agentCell}</p>
              <p>{formData.agentEmail}</p>
            </div>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-semibold text-lg mb-4">Project Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><strong>Pool Type:</strong> Fiberglass</p>
                <p><strong>Shape:</strong> {formData[`poolOption${formData.selectedOption}`].shape}</p>
                <p><strong>Size:</strong> {formData[`poolOption${formData.selectedOption}`].size}</p>
                <p><strong>Depth:</strong> {formData[`poolOption${formData.selectedOption}`].depth}</p>
              </div>
              <div>
                <p><strong>Risk Level:</strong> {riskAssessment.overall.toUpperCase()}</p>
                <p><strong>Base Price:</strong> ${pricing.basePoolPrice.toLocaleString()}</p>
                <p><strong>Site Adjustments:</strong> ${pricing.siteAdjustments.toLocaleString()}</p>
                <p><strong>Additional Options:</strong> ${pricing.additionalOptionsTotal.toLocaleString()}</p>
              </div>
            </div>
            <div className="border-t pt-4 mt-4">
              <div className="text-2xl font-bold text-green-600">
                Total Pool Cost: ${pricing.totalPoolCost.toLocaleString()}
              </div>
              {pricing.patioWork > 0 && (
                <div className="text-lg font-semibold text-blue-600 mt-2">
                  Total Project Cost: ${pricing.totalProjectCost.toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex gap-4 mt-8">
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
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-800 mr-4">BidBuilder - Fiberglass Pools</h1>
            {isOnline ? (
              <div className="flex items-center text-green-600">
                <Wifi className="w-4 h-4 mr-1" />
                <span className="text-sm">Live Pricing</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <WifiOff className="w-4 h-4 mr-1" />
                <span className="text-sm">Offline</span>
              </div>
            )}
          </div>
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
        
        {/* Progress Steps */}
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
        
        {/* Current Step Content */}
        <div className="mb-8">
          {renderStep()}
        </div>
        
        {/* Navigation */}
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
        
        {/* Real-time Pricing Alert */}
        {pricing.totalPoolCost > 0 && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <DollarSign className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-green-800">
                {isOnline ? 'Live' : 'Cached'} fiberglass pool pricing: ${pricing.totalPoolCost.toLocaleString()}
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