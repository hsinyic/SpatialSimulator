/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var shaleplay_or = ee.FeatureCollection("ft:1EIjMHaQqs6SGoIdocVDIQJfFQXVwVKr4tbOgpy6c"),
    GOM_offshore = ee.FeatureCollection("ft:1RkZEvZUCiE09ZyMOpkNBhjFik_VeZSAkCPqPK30S"),
    conventional_play = ee.FeatureCollection("ft:11jfMGryj5DdmBhG0GMP6ZcKWIK2oatWGUR1w9QUt"),
    GOM_boundary = ee.FeatureCollection("ft:1uOqEshx2FIgESMxBUB8IA0Mxxx2rbUlNcv6-cOS6"),
    Well = ee.FeatureCollection("ft:1Rto8ImdBnuDcBNX-ApGkuSfZf7UetvXjjFPc6RAu");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
// ########
// # Misc printout of ee.Date functions 
// ########

print(ee.Number(
    ee.Date(ee.Number(1009843200000))
    ))

print(
    ee.Date(ee.Number(949363200000)).get('year')
)

print(
    ee.Date.fromYMD(2000, 2, 1)
)


// ######
// # Null filter for First Prod Date
// ########

var add_location_label=  function(feature){
  feature = ee.Feature(feature);
  var property = ee.Number(feature.get('SurfaceLongitude'))
  var label = ee.Algorithms.If(property, 0, 1 ); // 1 means without surfaceLongitude 
  return(ee.Feature(feature).set("location",label )
  );
};

var add_time_label=  function(feature){
  feature = ee.Feature(feature);
  var property = ee.Number(feature.get('First Prod Year'))
  var label =ee.Algorithms.If(property, 0, 1 ) //1 means without First Production Date
  return(ee.Feature(feature).set("time",label));
};  // below investigate First Prod Year != First Prod Date (Year), 5 mismatched entry. However, to filter out Null the two are consistent


var processed_wells = ee.FeatureCollection(Well)
.map(add_location_label)
.map(add_time_label);

// Number of location label should match the null filterMetadata 
print("location label", processed_wells.aggregate_sum('location'))
print("filterMetadata", Well.filterMetadata('SurfaceLongitude', 'not_equals', null).aggregate_count('Well Count'))
print("total count location label", processed_wells.aggregate_count('Well Count'))
print("total count filterMetadata", Well.aggregate_count('Well Count'))

print("time label", processed_wells.aggregate_sum('time'))
print("filterMetadata", Well.filterMetadata('First Prod Date', 'not_equals', null).aggregate_count('Well Count'))
print("total count time label", processed_wells.aggregate_count('Well Count'))
print("total count filterMetadata", Well.aggregate_count('Well Count'))


// ######
// #  1. First Prod Date and First Prod Year selection >> for 2002 
// #  FPY: greater than 2001 
// #  FPD: after 2001-12-31 
// #
// #  2. filterMetadata ('First Prod Year', 'greater_than', 2001) 
// #  filters out null data. Same with First Prod Date 
// ########

print('Total number of wells without production date matches')
// Assume First Prod Year and First Prod Date are consistent 
print('well count No Production Date',
Well.filterMetadata('First Prod Date', 'not_equals', null)
.aggregate_sum('Well Count'));

print('well count No Production Year',
Well.filterMetadata('First Prod Year', 'not_equals', null)
.aggregate_sum('Well Count'));

print('', '', '')



print('When queried by dates, it doesnt match -- For wells 2002, 2003, 2004, 2005...etc ')

print('well count Production Date: After 2001-12-31 ',
Well.filterMetadata('First Prod Date', 'not_equals', null)
.filterMetadata('First Prod Date','greater_than', ee.Date('2001-12-31').millis())
.aggregate_sum('Well Count'));

print('well count Production Date: After 2002-01-01',
Well.filterMetadata('First Prod Date', 'not_equals', null)
.filterMetadata('First Prod Date','greater_than', ee.Date('2002-01-01').millis())
.aggregate_sum('Well Count'));

print('well count Production Year: Greater than 2001 ',
Well.filterMetadata('First Prod Year', 'not_equals', null)
.filterMetadata('First Prod Year','greater_than', 2001)
.aggregate_sum('Well Count'));

print('mismatch is in 5 entries, 483518-483513 = 5')

print('', '', '')







print('Without Null filtering')

print('well count Production Date: After 2001-12-31 ',
Well
.filterMetadata('First Prod Date','greater_than', ee.Date('2001-12-31').millis())
.aggregate_sum('Well Count'));

print('well count Production Date: After 2002-01-01',
Well
.filterMetadata('First Prod Date','greater_than', ee.Date('2002-01-01').millis())
.aggregate_sum('Well Count'));


print('well count Production Year: Greater than 2001 ',
Well
.filterMetadata('First Prod Year','greater_than', 2001)
.aggregate_sum('Well Count'));

print('well count Production Year: Greater than 2002 ',
Well
.filterMetadata('First Prod Year','greater_than', 2002)
.aggregate_sum('Well Count'));


print('', '', '')



// ########
// # Export the mismatched records. It's the problem of reading from the original active_well.csv files  
// ########


var extract_year=  function(feature){
  feature = ee.Feature(feature);
  var date = ee.Number(feature.get('First Prod Date'));
  date = ee.Date(date).get('year');
  date = ee.Number(date);
  var year = ee.Number(feature.get('First Prod Year'));
  var difference = date.subtract(year);
  return(ee.Feature(feature)
  .set("years_difference",difference)
  .set("indicator", ee.Algorithms.If(difference.neq(0), 1, 0))
  );
};


var test = Well.filterMetadata('First Prod Date', 'not_equals', null).map(extract_year); 
// var sample = Well.filterMetadata('SerialNumber2', 'greater_than', 13).filterMetadata('SerialNumber2', 'less_than', 23005).filterMetadata('First Prod Date', 'not_equals', null)

// 5 entries have mismatch (1928 >> 2028, 1917 >> 2017 .etc for wells between 1800 and 1930 )
Export.table.toDrive(test.filterMetadata('indicator', 'not_equals', 0)
.select(['First Prod Date', 'First Prod Year','years_difference', 'SerialNumber2'])
, "date_year_mismatch"  );





