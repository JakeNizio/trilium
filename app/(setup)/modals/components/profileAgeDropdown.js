import { globalStyles, globalSizes, globalColors } from '../../../../globalDesign';
import { Entypo } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

// birthday dropdown selector with month day and year
const ProfileAgeDropdown = ({ title, value, setValue, hasValidBirthday }) => {
    // selector state
    const [isMonthFocus, setIsMonthFocus] = useState(false);
    const [isDayFocus, setIsDayFocus] = useState(false);
    const [isYearFocus, setIsYearFocus] = useState(false);

    // date state
    const [month, setMonth] = useState();
    const [day, setDay] = useState();
    const [year, setYear] = useState();

    const [combined, setCombined] = useState({
        month: '',
        day: '',
        year: ''
    });

    // date values
    const [months, setMonths] = useState([
        {label: 'Jan', value: '00'},
        {label: 'Feb', value: '01'},
        {label: 'Mar', value: '02'},
        {label: 'Apr', value: '03'},
        {label: 'May', value: '04'},
        {label: 'Jun', value: '05'},
        {label: 'Jul', value: '06'},
        {label: 'Aug', value: '07'},
        {label: 'Sep', value: '08'},
        {label: 'Oct', value: '09'},
        {label: 'Nov', value: '10'},
        {label: 'Dec', value: '11'},
    ]);
    const [days, setDays] = useState([
        {label: '1', value: '01'},
        {label: '2', value: '02'},
        {label: '3', value: '03'},
        {label: '4', value: '04'},
        {label: '5', value: '05'},
        {label: '6', value: '06'},
        {label: '7', value: '07'},
        {label: '8', value: '08'},
        {label: '9', value: '09'},
        {label: '10', value: '10'},
        {label: '11', value: '11'},
        {label: '12', value: '12'},
        {label: '13', value: '13'},
        {label: '14', value: '14'},
        {label: '15', value: '15'},
        {label: '16', value: '16'},
        {label: '17', value: '17'},
        {label: '18', value: '18'},
        {label: '19', value: '19'},
        {label: '20', value: '20'},
        {label: '21', value: '21'},
        {label: '22', value: '22'},
        {label: '23', value: '23'},
        {label: '24', value: '24'},
        {label: '25', value: '25'},
        {label: '26', value: '26'},
        {label: '27', value: '27'},
        {label: '28', value: '28'},
        {label: '29', value: '29'},
        {label: '30', value: '30'},
        {label: '31', value: '31'},
    ]);
    const [years, setYears] = useState([
        {label: '2023', value: '2023'},
        {label: '2022', value: '2022'},
        {label: '2021', value: '2021'},
        {label: '2020', value: '2020'},
        {label: '2019', value: '2019'},
        {label: '2018', value: '2018'},
        {label: '2017', value: '2017'},
        {label: '2016', value: '2016'},
        {label: '2015', value: '2015'},
        {label: '2014', value: '2014'},
        {label: '2013', value: '2013'},
        {label: '2012', value: '2012'},
        {label: '2011', value: '2011'},
        {label: '2010', value: '2010'},
        {label: '2009', value: '2009'},
        {label: '2008', value: '2008'},
        {label: '2007', value: '2007'},
        {label: '2006', value: '2006'},
        {label: '2005', value: '2005'},
        {label: '2004', value: '2004'},
        {label: '2003', value: '2003'},
        {label: '2002', value: '2002'},
        {label: '2001', value: '2001'},
        {label: '2000', value: '2000'},
        {label: '1999', value: '1999'},
        {label: '1998', value: '1998'},
        {label: '1997', value: '1997'},
        {label: '1996', value: '1996'},
        {label: '1995', value: '1995'},
        {label: '1994', value: '1994'},
        {label: '1993', value: '1993'},
        {label: '1992', value: '1992'},
        {label: '1991', value: '1991'},
        {label: '1990', value: '1990'},
        {label: '1989', value: '1989'},
        {label: '1988', value: '1988'},
        {label: '1987', value: '1987'},
        {label: '1986', value: '1986'},
        {label: '1985', value: '1985'},
        {label: '1984', value: '1984'},
        {label: '1983', value: '1983'},
        {label: '1982', value: '1982'},
        {label: '1981', value: '1981'},
        {label: '1980', value: '1980'},
        {label: '1979', value: '1979'},
        {label: '1978', value: '1978'},
    ]);

    // sets date state based on changing values
    // becomes redundant after first db pull
    useEffect(() => {
        if (value && !month) {
            setYear(value.split("/")[2]);
            setDay(value.split("/")[1]);
            setMonth(value.split("/")[0]);
            setCombined({
                month: value.split("/")[0],
                day: value.split("/")[1],
                year: value.split("/")[2]
            });
        }
    },[value])

    // updates the combined date state and the value state with changes to one of the dropdowns
    const updateField = (item, category) => {
        var output;
        // creates the appropriate combined state depending on what dropdown changed
        if (category === 'month') {
            setCombined({...combined, month: item.value});
            output = `${item.value}/${combined.day}/${combined.year}`;
        } else if (category === 'day') {
            setCombined({...combined, day: item.value});
            output = `${combined.month}/${item.value}/${combined.year}`;
        } else if (category === 'year') {
            setCombined({...combined, year: item.value});
            output = `${combined.month}/${combined.day}/${item.value}`;
        }

        // if all fields are entered then updates the value state
        if (!(output.split('/')[0] === '' || output.split('/')[1] === '' || output.split('/')[2] === '')) {
            setValue(output);
        }
    }

    return (
        <View style={{...styles.card, borderColor: hasValidBirthday ? 'white' : globalColors.error}}>
            {/* <Text style={{...globalStyles.fontSmallBold, color: globalColors.darkPrimary}}>{title}: </Text> */}
            <View style={{flex: 1, flexDirection: 'row', marginLeft: 4}}>
                {/* months dropdown */}
                <Dropdown 
                    style={[styles.dropdown, isMonthFocus && { borderColor: 'blue' }]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    data={months}
                    labelField="label"
                    valueField="value"
                    placeholder={!isMonthFocus ? 'Month' : '---'}
                    value={month}
                    onFocus={() => setIsMonthFocus(true)}
                    onBlur={() => setIsMonthFocus(false)}
                    onChange={item => {
                        setMonth(item)
                        updateField(item, 'month')
                        setIsMonthFocus(false);
                    }}
                    renderRightIcon={() => (
                        <Entypo 
                            name="pencil" 
                            color={globalColors.secondary}
                            size={globalSizes.medium}
                        />
                    )}
                />
                {/* days dropdown */}
                <Dropdown 
                    style={[styles.dropdown, isDayFocus && { borderColor: 'blue' }]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    data={days}
                    labelField="label"
                    valueField="value"
                    placeholder={!isDayFocus ? 'Day' : '---'}
                    value={day}
                    onFocus={() => setIsDayFocus(true)}
                    onBlur={() => setIsDayFocus(false)}
                    onChange={item => {
                        setDay(item)
                        updateField(item, 'day')
                        setIsDayFocus(false);
                    }}
                    renderRightIcon={() => (
                        <Entypo 
                            name="pencil" 
                            color={globalColors.secondary}
                            size={globalSizes.medium}
                        />
                    )}
                />
                {/* years dropdown */}
                <Dropdown 
                    style={[styles.dropdown, isYearFocus && { borderColor: 'blue' }]}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    data={years}
                    labelField="label"
                    valueField="value"
                    placeholder={!isYearFocus ? 'Year' : '---'}
                    value={year}
                    onFocus={() => setIsYearFocus(true)}
                    onBlur={() => setIsYearFocus(false)}
                    onChange={item => {
                        setYear(item)
                        updateField(item, 'year')
                        setIsYearFocus(false);
                    }}
                    renderRightIcon={() => (
                        <Entypo 
                            name="pencil" 
                            color={globalColors.secondary}
                            size={globalSizes.medium}
                        />
                    )}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        position: 'relative',
        flexDirection: 'row',
        paddingVertical: 16,
        paddingHorizontal: 10,
        width: '100%',
        borderRadius: 10,
        alignItems: 'center',
        ...globalStyles.boxShadows,
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: 'white'
    },
    dropdown: {
        height: 22,
        // width: '100%',
        flex: 1,
        paddingRight: 0
    },
    placeholderStyle: {
        ...globalStyles.fontSmall,
        color: globalColors.darkNeutral
    },
    selectedTextStyle: {
        ...globalStyles.fontSmall,
        color: globalColors.darkNeutral
    }
})

export default ProfileAgeDropdown;