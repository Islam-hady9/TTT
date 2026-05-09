# Requirements Document: Fish Lifecycle Management
# مستند المتطلبات: إدارة دورة حياة السمكة

## Introduction

This document specifies the requirements for implementing complete fish lifecycle management in the Tibyan aquaculture farm management system. The feature tracks fish from eggs through harvest, calculating all key performance indicators (KPIs) including biomass, Feed Conversion Ratio (FCR), Specific Growth Rate (SGR), mortality rates, and harvest predictions. The system supports both RAS (Recirculating Aquaculture System) and Biofloc technologies across three production units: Hatchery, Growout, and Fattening.

يحدد هذا المستند متطلبات تطبيق إدارة دورة حياة السمكة الكاملة في نظام تبيان لإدارة مزارع الاستزراع المائي. تتتبع الميزة الأسماك من البيض حتى الحصاد، مع حساب جميع مؤشرات الأداء الرئيسية بما في ذلك الكتلة الحية، معامل التحويل الغذائي، معدل النمو النوعي، معدلات النفوق، وتوقعات الحصاد. يدعم النظام تقنيتي RAS و Biofloc عبر ثلاث وحدات إنتاج: المفرخ، النمو، والتسمين.

## Glossary

- **System**: The Tibyan aquaculture farm management system (نظام تبيان)
- **Batch**: A group of fish stocked together with unique tracking code (دورة/دفعة)
- **Lifecycle_Manager**: The component responsible for tracking fish lifecycle stages (مدير دورة الحياة)
- **Biomass_Calculator**: The component that calculates total fish biomass (حاسبة الكتلة الحية)
- **FCR_Calculator**: The component that calculates Feed Conversion Ratio (حاسبة معامل التحويل الغذائي)
- **SGR_Calculator**: The component that calculates Specific Growth Rate (حاسبة معدل النمو النوعي)
- **Weight_Predictor**: The component that predicts future fish weight (متنبئ الوزن)
- **Harvest_Predictor**: The component that predicts harvest date (متنبئ تاريخ الحصاد)
- **Transfer_Manager**: The component that handles fish transfers between ponds (مدير النقل)
- **Sampling_Recorder**: The component that records periodic weight measurements (مسجل الوزن الدوري)
- **History_Tracker**: The component that maintains complete batch history (متتبع التاريخ)
- **Alert_Generator**: The component that generates automatic alerts (مولد التنبيهات)
- **Stage**: Fish development phase (eggs, fry, fingerlings, juveniles, young_fish, fattening) (مرحلة)
- **Biomass**: Total live weight of all fish in a batch (الكتلة الحية)
- **FCR**: Feed Conversion Ratio - feed consumed divided by weight gained (معامل التحويل الغذائي)
- **SGR**: Specific Growth Rate - daily growth percentage (معدل النمو النوعي)
- **Sampling**: Periodic measurement of average fish weight (الوزن الدوري)
- **Transfer**: Moving fish from one pond to another (النقل)
- **Harvest**: Final collection of market-ready fish (الحصاد)
- **Mortality_Event**: Recording of fish deaths (حدث نفوق)
- **Feeding_Event**: Recording of feed distribution (حدث تغذية)
- **Water_Quality_Reading**: Measurement of water parameters (قراءة جودة المياه)
- **Hatchery_Unit**: Production unit for eggs, fry, and fingerlings using RAS (وحدة المفرخ)
- **Growout_Unit**: Production unit for juveniles and young fish using Biofloc (وحدة النمو)
- **Fattening_Unit**: Production unit for final growth to market weight using Biofloc (وحدة التسمين)
- **Market_Weight**: Target weight for harvest (350-600g) (وزن السوق)
- **Stocking**: Initial placement of fish in a pond (التخزين)
- **Engineer**: Farm staff member responsible for daily operations (مهندس المزرعة)

## Requirements

### Requirement 1: Batch Creation and Initialization

**User Story:** As a farm engineer, I want to create a new batch with initial stocking data, so that I can begin tracking the fish lifecycle from the start.

كمهندس مزرعة، أريد إنشاء دورة جديدة مع بيانات التخزين الأولية، حتى أتمكن من بدء تتبع دورة حياة السمكة من البداية.

#### Acceptance Criteria

1. WHEN an Engineer creates a new Batch, THE System SHALL record batch_code, pond_id, stocking_date, initial_count, avg_weight, stage, source, and supplier
2. WHEN a Batch is created, THE System SHALL set current_count equal to initial_count
3. WHEN a Batch is created, THE System SHALL set status to "active"
4. WHEN a Batch is created, THE Biomass_Calculator SHALL calculate initial biomass as initial_count multiplied by avg_weight
5. WHEN a Batch is created with duplicate batch_code, THE System SHALL return an error message
6. WHEN a Batch is created, THE History_Tracker SHALL record a "created" event with all initial parameters

### Requirement 2: Lifecycle Stage Management

**User Story:** As a farm engineer, I want the system to track which lifecycle stage each batch is in, so that I can apply appropriate feeding and management practices.

كمهندس مزرعة، أريد من النظام تتبع المرحلة التي تمر بها كل دورة، حتى أتمكن من تطبيق ممارسات التغذية والإدارة المناسبة.

#### Acceptance Criteria

1. WHEN avg_weight is less than 0.001g, THE Lifecycle_Manager SHALL set stage to "eggs"
2. WHEN avg_weight is between 0.001g and 0.1g, THE Lifecycle_Manager SHALL set stage to "fry"
3. WHEN avg_weight is between 0.1g and 1g, THE Lifecycle_Manager SHALL set stage to "fingerlings"
4. WHEN avg_weight is between 1g and 30g, THE Lifecycle_Manager SHALL set stage to "juveniles"
5. WHEN avg_weight is between 30g and 200g, THE Lifecycle_Manager SHALL set stage to "young_fish"
6. WHEN avg_weight is greater than 200g, THE Lifecycle_Manager SHALL set stage to "fattening"
7. WHEN stage changes, THE History_Tracker SHALL record a stage transition event

### Requirement 3: Biomass Calculation

**User Story:** As a farm manager, I want the system to automatically calculate biomass after every change, so that I can monitor total fish weight in real-time.

كمدير مزرعة، أريد من النظام حساب الكتلة الحية تلقائياً بعد كل تغيير، حتى أتمكن من مراقبة الوزن الإجمالي للأسماك في الوقت الفعلي.

#### Acceptance Criteria

1. WHEN current_count or avg_weight changes, THE Biomass_Calculator SHALL calculate biomass as current_count multiplied by avg_weight
2. WHEN a Mortality_Event is recorded, THE Biomass_Calculator SHALL recalculate biomass using updated current_count
3. WHEN a Sampling is performed, THE Biomass_Calculator SHALL recalculate biomass using updated avg_weight
4. THE Biomass_Calculator SHALL store biomass in grams with precision to two decimal places
5. WHEN biomass is calculated, THE System SHALL make the value available for feeding calculations

### Requirement 4: Feed Conversion Ratio (FCR) Calculation

**User Story:** As a farm owner, I want the system to calculate FCR for each batch, so that I can evaluate feeding efficiency and production costs.

كمالك مزرعة، أريد من النظام حساب معامل التحويل الغذائي لكل دورة، حتى أتمكن من تقييم كفاءة التغذية وتكاليف الإنتاج.

#### Acceptance Criteria

1. WHEN a Feeding_Event is recorded, THE FCR_Calculator SHALL add feed_amount to total_feed_consumed for the Batch
2. WHEN avg_weight increases, THE FCR_Calculator SHALL calculate weight_gained as (current_count multiplied by new_avg_weight) minus (current_count multiplied by previous_avg_weight)
3. WHEN weight_gained is greater than zero, THE FCR_Calculator SHALL calculate FCR as total_feed_consumed divided by weight_gained
4. THE FCR_Calculator SHALL store FCR with precision to two decimal places
5. WHEN FCR is greater than 1.8, THE Alert_Generator SHALL create a warning alert
6. WHEN FCR is between 1.4 and 1.8, THE System SHALL classify FCR as "good"
7. WHEN FCR is between 1.1 and 1.4, THE System SHALL classify FCR as "excellent"

### Requirement 5: Specific Growth Rate (SGR) Calculation

**User Story:** As a farm engineer, I want the system to calculate SGR, so that I can monitor daily growth performance and identify growth problems early.

كمهندس مزرعة، أريد من النظام حساب معدل النمو النوعي، حتى أتمكن من مراقبة أداء النمو اليومي وتحديد مشاكل النمو مبكراً.

#### Acceptance Criteria

1. WHEN a Sampling is performed, THE SGR_Calculator SHALL calculate days_elapsed since previous sampling or stocking_date
2. WHEN days_elapsed is greater than zero, THE SGR_Calculator SHALL calculate SGR as ((natural_log(new_avg_weight) minus natural_log(previous_avg_weight)) divided by days_elapsed) multiplied by 100
3. THE SGR_Calculator SHALL store SGR as percentage with precision to two decimal places
4. WHEN SGR is less than 5 percent, THE Alert_Generator SHALL create a warning alert indicating poor growth
5. WHEN SGR is between 5 and 10 percent, THE System SHALL classify growth as "good"
6. WHEN SGR is greater than 10 percent, THE System SHALL classify growth as "excellent"

### Requirement 6: Mortality Rate Tracking

**User Story:** As a farm manager, I want the system to track mortality rates, so that I can identify health problems and take corrective action.

كمدير مزرعة، أريد من النظام تتبع معدلات النفوق، حتى أتمكن من تحديد المشاكل الصحية واتخاذ الإجراءات التصحيحية.

#### Acceptance Criteria

1. WHEN a Mortality_Event is recorded, THE System SHALL subtract mortality_count from current_count
2. WHEN current_count changes due to mortality, THE System SHALL calculate mortality_rate as (total_mortality divided by initial_count) multiplied by 100
3. WHEN mortality_rate exceeds 35 percent in Hatchery_Unit, THE Alert_Generator SHALL create a critical alert
4. WHEN mortality_rate exceeds 10 percent in Growout_Unit or Fattening_Unit, THE Alert_Generator SHALL create a critical alert
5. WHEN a Mortality_Event is recorded, THE System SHALL calculate survival_rate as (current_count divided by initial_count) multiplied by 100
6. WHEN a Mortality_Event is recorded, THE History_Tracker SHALL record the event with mortality_count, cause, and timestamp

### Requirement 7: Periodic Weight Sampling

**User Story:** As a farm engineer, I want to record periodic weight measurements, so that the system can track growth progress and update calculations.

كمهندس مزرعة، أريد تسجيل قياسات الوزن الدورية، حتى يتمكن النظام من تتبع تقدم النمو وتحديث الحسابات.

#### Acceptance Criteria

1. WHEN an Engineer performs Sampling, THE Sampling_Recorder SHALL record sample_count, total_sample_weight, and sampling_date
2. WHEN Sampling is recorded, THE Sampling_Recorder SHALL calculate new_avg_weight as total_sample_weight divided by sample_count
3. WHEN new_avg_weight is calculated, THE System SHALL update avg_weight in the Batch
4. WHEN avg_weight is updated, THE Biomass_Calculator SHALL recalculate biomass
5. WHEN avg_weight is updated, THE SGR_Calculator SHALL calculate SGR
6. WHEN avg_weight is updated, THE Lifecycle_Manager SHALL update stage if weight thresholds are crossed
7. WHEN Sampling is recorded, THE History_Tracker SHALL record a "sampling" event with sample_count, avg_weight, and date

### Requirement 8: Inter-Pond Transfer Management

**User Story:** As a farm engineer, I want to transfer fish between ponds when they reach appropriate size, so that I can maintain optimal stocking density and production flow.

كمهندس مزرعة، أريد نقل الأسماك بين الأحواض عندما تصل إلى الحجم المناسب، حتى أتمكن من الحفاظ على كثافة التخزين المثلى وتدفق الإنتاج.

#### Acceptance Criteria

1. WHEN an Engineer initiates a Transfer, THE Transfer_Manager SHALL record from_pond_id, to_pond_id, transfer_count, avg_weight, and transfer_date
2. WHEN a Transfer is initiated, THE System SHALL verify that from_pond_id contains an active Batch
3. WHEN a Transfer is initiated, THE System SHALL verify that transfer_count does not exceed current_count
4. WHEN a Transfer is completed, THE Transfer_Manager SHALL update pond_id to to_pond_id in the Batch
5. WHEN a Transfer is completed, THE Transfer_Manager SHALL set status to "transferred" for the original pond record
6. WHEN a Transfer is completed, THE History_Tracker SHALL record a "transfer" event with from_pond_id, to_pond_id, transfer_count, and date
7. WHEN avg_weight is 1g and pond is in Hatchery_Unit, THE Alert_Generator SHALL suggest transfer to Growout_Unit
8. WHEN avg_weight is 200g and pond is in Growout_Unit, THE Alert_Generator SHALL suggest transfer to Fattening_Unit

### Requirement 9: Weight Prediction

**User Story:** As a farm manager, I want the system to predict future fish weight, so that I can plan harvest timing and resource allocation.

كمدير مزرعة، أريد من النظام توقع وزن الأسماك المستقبلي، حتى أتمكن من تخطيط توقيت الحصاد وتخصيص الموارد.

#### Acceptance Criteria

1. WHEN an Engineer requests weight prediction for N days, THE Weight_Predictor SHALL retrieve current avg_weight and latest SGR
2. WHEN SGR is available, THE Weight_Predictor SHALL calculate predicted_weight as current_avg_weight multiplied by e raised to power of (SGR multiplied by N divided by 100)
3. WHEN SGR is not available, THE Weight_Predictor SHALL return an error message indicating insufficient data
4. THE Weight_Predictor SHALL return predicted_weight in grams with precision to two decimal places
5. WHEN predicted_weight is calculated, THE System SHALL display confidence level based on SGR data recency

### Requirement 10: Harvest Date Prediction

**User Story:** As a farm owner, I want the system to predict when fish will reach market weight, so that I can coordinate with buyers and plan sales.

كمالك مزرعة، أريد من النظام توقع متى ستصل الأسماك إلى وزن السوق، حتى أتمكن من التنسيق مع المشترين وتخطيط المبيعات.

#### Acceptance Criteria

1. WHEN an Engineer requests harvest date prediction, THE Harvest_Predictor SHALL retrieve current avg_weight, target Market_Weight, and latest SGR
2. WHEN SGR is greater than zero, THE Harvest_Predictor SHALL calculate days_remaining as (natural_log(Market_Weight) minus natural_log(current_avg_weight)) divided by (SGR divided by 100)
3. WHEN days_remaining is calculated, THE Harvest_Predictor SHALL calculate predicted_harvest_date as current_date plus days_remaining
4. WHEN current avg_weight is greater than or equal to Market_Weight, THE Harvest_Predictor SHALL return zero days_remaining
5. WHEN SGR is zero or negative, THE Harvest_Predictor SHALL return an error message indicating growth stagnation
6. WHEN predicted_harvest_date is calculated, THE System SHALL display the date in format YYYY-MM-DD

### Requirement 11: Harvest Execution

**User Story:** As a farm engineer, I want to record harvest operations, so that I can finalize batch tracking and generate production reports.

كمهندس مزرعة، أريد تسجيل عمليات الحصاد، حتى أتمكن من إنهاء تتبع الدورة وإنشاء تقارير الإنتاج.

#### Acceptance Criteria

1. WHEN an Engineer initiates Harvest, THE System SHALL record harvest_count, avg_weight, total_harvest_weight, and harvest_date
2. WHEN Harvest is initiated, THE System SHALL verify that avg_weight is greater than or equal to 350g
3. WHEN Harvest is recorded, THE System SHALL calculate total_harvest_weight as harvest_count multiplied by avg_weight
4. WHEN Harvest is recorded, THE System SHALL set Batch status to "harvested"
5. WHEN Harvest is recorded, THE FCR_Calculator SHALL calculate final FCR for the complete cycle
6. WHEN Harvest is recorded, THE System SHALL calculate cycle_duration as harvest_date minus stocking_date in days
7. WHEN Harvest is recorded, THE History_Tracker SHALL record a "harvest" event with harvest_count, avg_weight, total_weight, and date
8. WHEN avg_weight is between 400g and 600g, THE Alert_Generator SHALL indicate optimal harvest weight achieved

### Requirement 12: Batch History Tracking

**User Story:** As a farm manager, I want to view complete batch history, so that I can analyze production cycles and identify improvement opportunities.

كمدير مزرعة، أريد عرض تاريخ الدورة الكامل، حتى أتمكن من تحليل دورات الإنتاج وتحديد فرص التحسين.

#### Acceptance Criteria

1. WHEN a Batch undergoes any lifecycle event, THE History_Tracker SHALL create a history record with action_type, timestamp, and relevant parameters
2. THE History_Tracker SHALL record events for "created", "transfer", "sampling", "mortality", "feeding", "water_quality", and "harvest" actions
3. WHEN an Engineer requests Batch history, THE System SHALL retrieve all history records ordered by timestamp ascending
4. WHEN history is displayed, THE System SHALL show action_type, date, from_pond, to_pond, count, avg_weight, and notes for each event
5. WHEN history is requested for a harvested Batch, THE System SHALL include final summary with total_feed, final_FCR, survival_rate, and cycle_duration

### Requirement 13: Daily Feed Amount Calculation

**User Story:** As a farm engineer, I want the system to calculate recommended daily feed amount, so that I can maintain optimal feeding rates for each lifecycle stage.

كمهندس مزرعة، أريد من النظام حساب كمية العلف اليومية الموصى بها، حتى أتمكن من الحفاظ على معدلات التغذية المثلى لكل مرحلة.

#### Acceptance Criteria

1. WHEN stage is "fry", THE System SHALL calculate daily_feed_amount as biomass multiplied by 0.15 to 0.18
2. WHEN stage is "fingerlings", THE System SHALL calculate daily_feed_amount as biomass multiplied by 0.10 to 0.15
3. WHEN stage is "juveniles", THE System SHALL calculate daily_feed_amount as biomass multiplied by 0.05 to 0.10
4. WHEN stage is "young_fish", THE System SHALL calculate daily_feed_amount as biomass multiplied by 0.03 to 0.05
5. WHEN stage is "fattening", THE System SHALL calculate daily_feed_amount as biomass multiplied by 0.01 to 0.03
6. WHEN daily_feed_amount is calculated, THE System SHALL display the amount in kilograms with precision to two decimal places
7. WHEN an Engineer requests feeding schedule, THE System SHALL divide daily_feed_amount by recommended meals_per_day for the stage

### Requirement 14: Automatic Alert Generation

**User Story:** As a farm manager, I want the system to generate automatic alerts for critical conditions, so that I can respond quickly to problems.

كمدير مزرعة، أريد من النظام إنشاء تنبيهات تلقائية للحالات الحرجة، حتى أتمكن من الاستجابة بسرعة للمشاكل.

#### Acceptance Criteria

1. WHEN FCR exceeds 1.8, THE Alert_Generator SHALL create an alert with severity "warning" and message "FCR exceeds target threshold"
2. WHEN SGR is less than 5 percent, THE Alert_Generator SHALL create an alert with severity "warning" and message "Growth rate below acceptable range"
3. WHEN mortality_rate exceeds stage-specific threshold, THE Alert_Generator SHALL create an alert with severity "critical" and message "Mortality rate exceeds acceptable limit"
4. WHEN avg_weight reaches transfer threshold, THE Alert_Generator SHALL create an alert with severity "info" and message "Batch ready for transfer to next unit"
5. WHEN avg_weight reaches Market_Weight, THE Alert_Generator SHALL create an alert with severity "info" and message "Batch ready for harvest"
6. WHEN Water_Quality_Reading is outside optimal range, THE Alert_Generator SHALL create an alert with severity based on deviation magnitude
7. WHEN an alert is created, THE System SHALL record alert_type, severity, message, batch_id, and timestamp

### Requirement 15: Comprehensive Batch Reports

**User Story:** As a farm owner, I want to generate comprehensive batch reports, so that I can evaluate production performance and make data-driven decisions.

كمالك مزرعة، أريد إنشاء تقارير شاملة للدورات، حتى أتمكن من تقييم أداء الإنتاج واتخاذ قرارات مبنية على البيانات.

#### Acceptance Criteria

1. WHEN an Engineer requests a Batch report, THE System SHALL include batch_code, stocking_date, harvest_date, cycle_duration, initial_count, final_count, and survival_rate
2. WHEN a Batch report is generated, THE System SHALL include initial_avg_weight, final_avg_weight, total_weight_gained, and SGR
3. WHEN a Batch report is generated, THE System SHALL include total_feed_consumed, final_FCR, and FCR_classification
4. WHEN a Batch report is generated, THE System SHALL include total_mortality, mortality_rate, and primary_mortality_causes
5. WHEN a Batch report is generated, THE System SHALL include transfer_history with dates and pond transitions
6. WHEN a Batch report is generated, THE System SHALL include average_water_quality_parameters for the cycle
7. WHEN a Batch report is generated, THE System SHALL calculate production_cost_per_kg if cost data is available
8. WHEN a report is requested, THE System SHALL support export formats PDF and Excel

### Requirement 16: Multi-Batch Dashboard View

**User Story:** As a farm manager, I want to view all active batches in a dashboard, so that I can monitor overall farm production status at a glance.

كمدير مزرعة، أريد عرض جميع الدورات النشطة في لوحة معلومات، حتى أتمكن من مراقبة حالة إنتاج المزرعة الإجمالية بنظرة واحدة.

#### Acceptance Criteria

1. WHEN a Manager accesses the dashboard, THE System SHALL display all Batches with status "active"
2. WHEN the dashboard is displayed, THE System SHALL show batch_code, pond_code, stage, current_count, avg_weight, and biomass for each Batch
3. WHEN the dashboard is displayed, THE System SHALL show days_in_current_stage and predicted_harvest_date for each Batch
4. WHEN the dashboard is displayed, THE System SHALL show latest FCR, SGR, and mortality_rate for each Batch
5. WHEN the dashboard is displayed, THE System SHALL highlight Batches with active alerts in red
6. WHEN the dashboard is displayed, THE System SHALL show total_farm_biomass as sum of all active Batch biomass values
7. WHEN a Manager selects a Batch, THE System SHALL navigate to detailed Batch view with complete history and metrics

### Requirement 17: Stage-Specific Feed Type Recommendations

**User Story:** As a farm engineer, I want the system to recommend appropriate feed type for each stage, so that I can ensure optimal nutrition for fish growth.

كمهندس مزرعة، أريد من النظام التوصية بنوع العلف المناسب لكل مرحلة، حتى أتمكن من ضمان التغذية المثلى لنمو الأسماك.

#### Acceptance Criteria

1. WHEN stage is "fry" or "fingerlings", THE System SHALL recommend feed_type "starter"
2. WHEN stage is "juveniles", THE System SHALL recommend feed_type "grower"
3. WHEN stage is "young_fish", THE System SHALL recommend feed_type "finisher"
4. WHEN stage is "fattening", THE System SHALL recommend feed_type "fattening"
5. WHEN a Feeding_Event is recorded with incorrect feed_type for stage, THE Alert_Generator SHALL create a warning alert
6. WHEN feed_type recommendation is displayed, THE System SHALL show recommended pellet_size for the stage

### Requirement 18: Water Quality Impact on Growth

**User Story:** As a farm manager, I want the system to correlate water quality with growth performance, so that I can identify environmental factors affecting production.

كمدير مزرعة، أريد من النظام ربط جودة المياه بأداء النمو، حتى أتمكن من تحديد العوامل البيئية المؤثرة على الإنتاج.

#### Acceptance Criteria

1. WHEN Water_Quality_Reading shows DO less than 6.0 mg per L, THE System SHALL flag potential growth impact
2. WHEN Water_Quality_Reading shows pH outside range 7.0 to 8.3, THE System SHALL flag potential growth impact
3. WHEN Water_Quality_Reading shows temperature outside range 25 to 30 degrees Celsius, THE System SHALL flag potential growth impact
4. WHEN Water_Quality_Reading shows TAN greater than 0.5 mg per L, THE System SHALL flag potential growth impact
5. WHEN SGR decreases while water quality is flagged, THE System SHALL create a correlation alert suggesting water quality as cause
6. WHEN a Batch report is generated, THE System SHALL include percentage of days with optimal water quality

### Requirement 19: Batch Comparison Analytics

**User Story:** As a farm owner, I want to compare performance across multiple batches, so that I can identify best practices and replicate success.

كمالك مزرعة، أريد مقارنة الأداء عبر دورات متعددة، حتى أتمكن من تحديد أفضل الممارسات وتكرار النجاح.

#### Acceptance Criteria

1. WHEN an Owner requests batch comparison, THE System SHALL display FCR, SGR, survival_rate, and cycle_duration for selected Batches
2. WHEN batch comparison is displayed, THE System SHALL calculate average_FCR, average_SGR, and average_survival_rate across selected Batches
3. WHEN batch comparison is displayed, THE System SHALL highlight the Batch with best FCR in green
4. WHEN batch comparison is displayed, THE System SHALL highlight the Batch with worst FCR in red
5. WHEN batch comparison is displayed, THE System SHALL show feed_type, water_quality_average, and stocking_density for each Batch
6. WHEN batch comparison is displayed, THE System SHALL support filtering by date_range, unit_type, and stage

### Requirement 20: Data Validation and Integrity

**User Story:** As a system administrator, I want the system to validate all input data, so that calculations remain accurate and reliable.

كمسؤول نظام، أريد من النظام التحقق من صحة جميع بيانات الإدخال، حتى تظل الحسابات دقيقة وموثوقة.

#### Acceptance Criteria

1. WHEN avg_weight is entered, THE System SHALL verify that the value is greater than zero and less than 1000g
2. WHEN mortality_count is entered, THE System SHALL verify that the value does not exceed current_count
3. WHEN transfer_count is entered, THE System SHALL verify that the value does not exceed current_count
4. WHEN harvest_count is entered, THE System SHALL verify that the value does not exceed current_count
5. WHEN sample_count is entered for Sampling, THE System SHALL verify that the value is at least 30 fish
6. WHEN stocking_date is entered, THE System SHALL verify that the date is not in the future
7. WHEN any calculation produces a negative value, THE System SHALL log an error and alert the administrator
8. WHEN data validation fails, THE System SHALL return a descriptive error message indicating the constraint violated
