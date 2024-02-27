import {Text} from 'react-native-paper';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import React, {useEffect, useState} from 'react';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {
  CANCELLATION_REASONS,
  CURRENCY_SYMBOLS,
  RETURN_REASONS,
} from '../../../../../utils/constants';
import ReturnStatus from './ReturnStatus';
import {useAppTheme} from '../../../../../utils/theme';

const today = moment();

const SingleItem = ({item}: {item: any}) => {
  const theme = useAppTheme();
  const styles = makeStyles(theme.colors);

  let showItem = true;
  const typeTag = item.tags.find((tag: any) => tag.code === 'type');
  if (typeTag) {
    const itemCode = typeTag.list.find((tag: any) => tag.code === 'type');
    if (itemCode) {
      showItem = itemCode.value === 'item';
    } else {
      showItem = false;
    }
  } else {
    showItem = false;
  }

  if (showItem) {
    return (
      <View key={item.id} style={styles.item}>
        <FastImage
          source={{uri: item?.product?.descriptor?.symbol}}
          style={styles.itemImage}
        />
        <View style={styles.itemMeta}>
          <Text variant={'labelMedium'} style={styles.itemName}>
            {item?.product?.descriptor?.name}
          </Text>
          <View style={styles.itemTags}>
            {item?.product['@ondc/org/cancellable'] ? (
              <View style={styles.chip}>
                <Text variant={'labelMedium'}>Cancellable</Text>
              </View>
            ) : (
              <View style={styles.chip}>
                <Text variant={'labelMedium'}>Non-cancellable</Text>
              </View>
            )}
            {item?.product['@ondc/org/returnable'] ? (
              <View style={styles.chip}>
                <Text variant={'labelMedium'}>Returnable</Text>
              </View>
            ) : (
              <View style={styles.chip}>
                <Text variant={'labelMedium'}>Non-returnable</Text>
              </View>
            )}
          </View>
        </View>
        <Text variant={'labelMedium'}>Qty {item?.quantity?.count}</Text>
        <Text variant={'labelMedium'} style={styles.price}>
          {CURRENCY_SYMBOLS[item?.product?.price?.currency]}
          {Number(item?.quantity?.count * item?.product?.price?.value).toFixed(
            2,
          )}
        </Text>
      </View>
    );
  } else {
    return <View key={item.id} />;
  }
};

const ItemDetails = ({
  fulfillments,
  items,
}: {
  fulfillments: any[];
  items: any[];
}) => {
  const {orderDetails} = useSelector(({orderReducer}) => orderReducer);
  const navigation = useNavigation<any>();
  const theme = useAppTheme();
  const styles = makeStyles(theme.colors);
  const [shipmentFulfillmentList, setShipmentFulfillmentList] = useState<any[]>(
    [],
  );
  const [returnFulfillmentList, setReturnFulfillmentList] = useState<any[]>([]);
  const [cancelFulfillmentList, setCancelFulfillmentList] = useState<any[]>([]);

  useEffect(() => {
    const shipments: any[] = [];
    const returns: any[] = [];
    const cancels: any[] = [];

    fulfillments.forEach((fulfillment: any) => {
      switch (fulfillment.type) {
        case 'Delivery':
          shipments.push(fulfillment);
          break;

        case 'Return':
          returns.push(fulfillment);
          break;

        case 'Cancel':
          cancels.push(fulfillment);
          break;
      }
    });
    setShipmentFulfillmentList(shipments);
    setReturnFulfillmentList(returns);
    setCancelFulfillmentList(cancels);
  }, [fulfillments]);

  return (
    <>
      {shipmentFulfillmentList.length > 0 && (
        <View>
          <Text variant={'titleSmall'} style={styles.fulfilmentTitle}>
            Shipment Details
          </Text>
          {shipmentFulfillmentList?.map((fulfillment: any) => {
            const endDate = moment(fulfillment?.end?.time?.range?.end);

            return (
              <TouchableOpacity
                key={fulfillment.id}
                style={styles.container}
                onPress={() =>
                  navigation.navigate('OrderProductDetails', {
                    fulfillmentId: fulfillment.id,
                  })
                }>
                <View style={styles.header}>
                  <Text variant={'labelMedium'} style={styles.deliveryDate}>
                    Items will be delivered by{' '}
                    {today.isSame(endDate, 'day')
                      ? endDate.format('hh:mm a')
                      : endDate.format('Do MMM')}
                  </Text>
                  <View style={styles.statusContainer}>
                    <ReturnStatus code={fulfillment?.state?.descriptor?.code} />
                    <Icon name={'chevron-right'} size={20} color={'#686868'} />
                  </View>
                </View>
                {items
                  .filter(item => item.fulfillment_id === fulfillment.id)
                  .map((item, index) =>
                    item?.quantity?.count > 0 ? (
                      <SingleItem
                        key={`${item.id}${index}ShipmentFulfillment`}
                        item={item}
                      />
                    ) : (
                      <View key={`${item.id}${index}ShipmentFulfillment`} />
                    ),
                  )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {returnFulfillmentList.length > 0 && (
        <View>
          <Text variant={'titleSmall'} style={styles.fulfilmentTitle}>
            Return Details
          </Text>
          {returnFulfillmentList?.map((fulfillment: any) => {
            const isReturnInitiated =
              fulfillment?.state?.descriptor?.code === 'Return_Initiated';
            const fulfillmentHistory = orderDetails.fulfillmentHistory.filter(
              (one: any) => fulfillment.id === one.id,
            );
            const returnInitiated = fulfillmentHistory.find(
              (one: any) => one.state === 'Return_Initiated',
            );

            let itemId: any = null;
            let reasonId: any = null;
            const returnTag = fulfillment.tags.find(
              (tag: any) => tag.code === 'return_request',
            );
            if (isReturnInitiated) {
              const itemTag = returnTag.list.find(
                (tag: any) => tag.code === 'item_id',
              );
              itemId = itemTag.value;
            }
            const reasonIdTag = returnTag.list.find(
              (tag: any) => tag.code === 'reason_id',
            );
            reasonId = reasonIdTag.value;

            return (
              <TouchableOpacity
                key={fulfillment.id}
                style={styles.container}
                onPress={() =>
                  navigation.navigate('OrderReturnDetails', {
                    fulfillmentId: fulfillment.id,
                  })
                }>
                <View style={styles.header}>
                  <Text variant={'labelMedium'} style={styles.deliveryDate}>
                    {returnInitiated
                      ? `Return initiated on ${
                          today.isSame(moment(returnInitiated.createdAt), 'day')
                            ? moment(returnInitiated.createdAt).format(
                                'hh:mm a',
                              )
                            : moment(returnInitiated.createdAt).format('Do MMM')
                        }`
                      : ''}
                  </Text>
                  <View style={styles.statusContainer}>
                    <ReturnStatus
                      code={fulfillment?.state?.descriptor?.code}
                      fulfilment={fulfillmentHistory.find(
                        (one: any) =>
                          one.state === fulfillment?.state?.descriptor?.code,
                      )}
                    />
                    <Icon name={'chevron-right'} size={20} color={'#686868'} />
                  </View>
                </View>
                {fulfillment?.state?.descriptor?.code === 'Return_Initiated'
                  ? items
                      .filter(item => item.id === itemId)
                      .map((item, index) => (
                        <SingleItem
                          key={`${item.id}${index}ReturnFulfillment`}
                          item={item}
                        />
                      ))
                  : items
                      .filter(item => item.fulfillment_id === fulfillment.id)
                      .map((item, index) => (
                        <SingleItem
                          key={`${item.id}${index}ReturnFulfillment`}
                          item={item}
                        />
                      ))}
                <View style={styles.footer}>
                  <Text variant={'labelMedium'} style={styles.reason}>
                    {RETURN_REASONS.find(one => one.key === reasonId)?.value}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {cancelFulfillmentList.length > 0 && (
        <View>
          <Text variant={'titleSmall'} style={styles.fulfilmentTitle}>
            Cancel Details
          </Text>
          {cancelFulfillmentList?.map((fulfillment: any) => {
            const isReturnInitiated =
              fulfillment?.state?.descriptor?.code === 'Cancelled';

            const fulfillmentHistory = orderDetails.fulfillmentHistory.filter(
              (one: any) => fulfillment.id === one.id,
            );
            const cancelInitiated = fulfillmentHistory.find(
              (one: any) => one.state === 'Cancelled',
            );

            let itemId: any = null;
            let cancelId: any = null;
            if (isReturnInitiated) {
              const cancelTag = fulfillment.tags.find(
                (tag: any) => tag.code === 'cancel_request',
              );
              const returnTag = fulfillment.tags.find(
                (tag: any) => tag.code === 'quote_trail',
              );
              const reasonIdTag = cancelTag.list.find(
                (tag: any) => tag.code === 'reason_id',
              );
              const itemTag = returnTag.list.find(
                (tag: any) => tag.code === 'id',
              );
              itemId = itemTag.value;
              cancelId = reasonIdTag.value;
            }

            return (
              <View key={fulfillment.id} style={styles.container}>
                <View style={styles.header}>
                  <Text variant={'labelMedium'} style={styles.deliveryDate}>
                    {cancelInitiated
                      ? `Cancelled on ${
                          today.isSame(moment(cancelInitiated.createdAt), 'day')
                            ? moment(cancelInitiated.createdAt).format(
                                'hh:mm a',
                              )
                            : moment(cancelInitiated.createdAt).format('Do MMM')
                        }`
                      : ''}
                  </Text>
                  <View style={styles.statusContainer}>
                    <ReturnStatus code={fulfillment?.state?.descriptor?.code} />
                  </View>
                </View>
                {fulfillment?.state?.descriptor?.code === 'Cancelled'
                  ? items
                      .filter(item => item.id === itemId)
                      .map((item, index) => (
                        <SingleItem
                          key={`${item.id}${index}CancelFulfillment`}
                          item={item}
                        />
                      ))
                  : items
                      .filter(item => item.fulfillment_id === fulfillment.id)
                      .map((item, index) => (
                        <SingleItem
                          key={`${item.id}${index}CancelFulfillment`}
                          item={item}
                        />
                      ))}
                <View style={styles.footer}>
                  <Text variant={'labelMedium'} style={styles.reason}>
                    {
                      CANCELLATION_REASONS.find(one => one.key === cancelId)
                        ?.value
                    }
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </>
  );
};

const makeStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      borderRadius: 8,
      backgroundColor: '#FFF',
      borderWidth: 1,
      borderColor: '#E8E8E8',
      marginHorizontal: 16,
      paddingHorizontal: 16,
      paddingTop: 16,
      marginTop: 12,
      paddingBottom: 8,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: 12,
      marginBottom: 12,
      borderBottomColor: '#E8E8E8',
      borderBottomWidth: 1,
    },
    footer: {
      paddingTop: 12,
      borderTopColor: '#E8E8E8',
      borderTopWidth: 1,
    },
    reason: {
      color: '#686868',
    },
    item: {
      marginBottom: 12,
      flexDirection: 'row',
    },
    itemImage: {
      width: 32,
      height: 32,
      borderRadius: 8,
      marginRight: 10,
      backgroundColor: '#E8E8E8',
    },
    itemMeta: {
      flex: 1,
    },
    itemName: {
      marginBottom: 4,
    },
    itemTags: {
      flexDirection: 'row',
    },
    chip: {
      marginRight: 4,
      backgroundColor: '#E8E8E8',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 22,
    },
    deliveryDate: {
      color: '#686868',
      flex: 1,
      flexWrap: 'wrap',
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      justifyContent: 'flex-end',
    },
    price: {
      fontWeight: '700',
      marginLeft: 16,
    },
    fulfilmentTitle: {
      marginTop: 20,
      color: '#000',
      paddingHorizontal: 16,
    },
  });

export default ItemDetails;
