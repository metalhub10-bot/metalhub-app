import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '@/config/theme';
import { DELIVERY_OPTIONS, METAL_GROUPS } from '@/config/constants';
import { getPublicacionById, getSessionId, updatePublicacion, createPublicacion, assertSuccess } from '@/services/api';

type OperationType = 'vendo' | 'compro';

type PublicacionData = {
  tipo: OperationType;
  metal: string;
  cantidad: number;
  unidad: 'kg' | 'tn';
  precio?: number;
  precioAConvenir: boolean;
  descripcion?: string;
  entrega?: string;
  ubicacion?: string;
  urgente?: boolean;
  cerrada?: boolean;
};

const DELIVERY_MAP: Record<string, string> = {
  pickup_now: 'Retiro inmediato',
  pickup_coord: 'Coordinar retiro',
  shipping: 'Envío disponible',
};

const DELIVERY_REVERSE_MAP = Object.fromEntries(
  Object.entries(DELIVERY_MAP).map(([k, v]) => [v, k]),
);

export default function EditarPublicacionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [operation, setOperation] = useState<OperationType>('vendo');
  const [metalCategory, setMetalCategory] = useState<string | null>(null);
  const [metalSubtype, setMetalSubtype] = useState<string | null>(null);
  const [metalOtherText, setMetalOtherText] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<'kg' | 'tn'>('kg');
  const [price, setPrice] = useState('');
  const [priceNegotiable, setPriceNegotiable] = useState(false);
  const [delivery, setDelivery] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) {
      Alert.alert('Error', 'ID de publicación inválido', [{ text: 'Volver', onPress: () => router.back() }]);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await getPublicacionById(id);
        if (!res.success || !res.data) {
          Alert.alert('Error', res.message ?? res.error ?? 'No se encontró la publicación', [
            { text: 'Volver', onPress: () => router.back() },
          ]);
          return;
        }

        if (cancelled) return;

        const pub = res.data as PublicacionData;
        setOperation(pub.tipo);
        setQuantity(String(pub.cantidad ?? ''));
        setUnit(pub.unidad ?? 'kg');
        setPrice(pub.precioAConvenir ? '' : String(pub.precio ?? ''));
        setPriceNegotiable(!!pub.precioAConvenir);
        setDescription(pub.descripcion ?? '');
        setLocation(pub.ubicacion ?? '');
        setDelivery(pub.entrega ? DELIVERY_REVERSE_MAP[pub.entrega] ?? null : null);

        // Determine metal selection (group + subtype / other)
        const foundGroup = METAL_GROUPS.find((g) => pub.metal === g.label);
        if (foundGroup) {
          setMetalCategory(foundGroup.id ?? null);
          setMetalSubtype(null);
        } else {
          const [groupLabel, subtype] = pub.metal.split(' - ').map((s) => s.trim());
          const group = METAL_GROUPS.find((g) => g.label === groupLabel);
          if (group) {
            setMetalCategory(group.id ?? null);
            if (group.variants?.includes(subtype)) {
              setMetalSubtype(subtype);
            } else {
              setMetalSubtype(null);
            }
          } else {
            setMetalCategory('otro');
            setMetalOtherText(pub.metal);
          }
        }
      } catch (err) {
        Alert.alert('Error', err instanceof Error ? err.message : 'Error al cargar publicación', [
          { text: 'Volver', onPress: () => router.back() },
        ]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSave = async () => {
    if (!metalCategory) {
      Alert.alert('Error', 'Elige un tipo de material');
      return;
    }

    let metalLabel: string;
    if (metalCategory === 'otro') {
      const custom = metalOtherText.trim();
      if (!custom) {
        Alert.alert('Error', 'Escribe qué material estás publicando');
        return;
      }
      metalLabel = custom;
    } else {
      const selectedGroup = METAL_GROUPS.find((g) => g.id === metalCategory);
      if (!selectedGroup) {
        Alert.alert('Error', 'Elige un tipo de material');
        return;
      }
      if (selectedGroup.variants && selectedGroup.variants.length > 0 && !metalSubtype) {
        Alert.alert('Error', 'Elige una subcategoría dentro del material');
        return;
      }
      metalLabel =
        selectedGroup.variants && selectedGroup.variants.length > 0 && metalSubtype
          ? `${selectedGroup.label} - ${metalSubtype}`
          : selectedGroup.label;
    }

    const qty = parseFloat(quantity.replace(',', '.'));
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Error', 'Ingresa una cantidad válida');
      return;
    }
    if (!priceNegotiable && (price === '' || isNaN(parseFloat(price.replace(',', '.'))))) {
      Alert.alert('Error', 'Ingresa un precio o marca "A convenir"');
      return;
    }

    const sessionId = await getSessionId();
    if (!sessionId) {
      Alert.alert('Sesión requerida', 'Inicia sesión para editar la publicación.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Entrar', onPress: () => router.push('/login') },
      ]);
      return;
    }

    setSubmitting(true);
    try {
      const precioNum = priceNegotiable ? undefined : parseFloat(price.replace(',', '.'));
      const body = {
        tipo: operation,
        metal: metalLabel.trim(),
        cantidad: qty,
        unidad: unit,
        precio: precioNum,
        precioAConvenir: priceNegotiable,
        descripcion: description.trim() || undefined,
        entrega: delivery ? DELIVERY_MAP[delivery] : undefined,
        ubicacion: location.trim() || undefined,
        urgente: false,
      };
      if (id) {
        const res = await updatePublicacion(id, body);
        assertSuccess(res);
        Alert.alert('Actualizado', 'La publicación se actualizó correctamente.', [
          { text: 'Ver publicación', onPress: () => router.replace(`/publicacion/${id}`) },
        ]);
        return;
      }

      const res = await createPublicacion(body);
      assertSuccess(res);
      Alert.alert('Publicado', 'Tu oferta se publicó correctamente.', [
        {
          text: 'Ver mercado',
          onPress: () => router.replace('/(tabs)'),
        },
      ]);
      setMetalCategory(null);
      setMetalSubtype(null);
      setMetalOtherText('');
      setQuantity('');
      setPrice('');
      setDescription('');
      setLocation('');
      setDelivery(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar la publicación';
      Alert.alert('Error', message);
    } finally {
      setSubmitting(false);
    }
  };

  const title = id ? 'Editar publicación' : 'Publicar';

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.sectionLabel}>TIPO DE OPERACIÓN</Text>
        <View style={styles.operationRow}>
          <TouchableOpacity style={[styles.operationBtn, operation === 'vendo' && styles.operationBtnActive]} onPress={() => setOperation('vendo')}>
            <Text style={[styles.operationBtnText, operation === 'vendo' && styles.operationBtnTextActive]}>VENDO</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.operationBtn, operation === 'compro' && styles.operationBtnActiveCompro]} onPress={() => setOperation('compro')}>
            <Text style={[styles.operationBtnText, operation === 'compro' && styles.operationBtnTextActive]}>COMPRO</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionLabel}>METAL</Text>
        <View style={styles.metalGrid}>
          {METAL_GROUPS.map((group) => (
            <TouchableOpacity
              key={group.id}
              style={[
                styles.metalChip,
                metalCategory === group.id && styles.metalChipActive,
              ]}
              onPress={() =>
                setMetalCategory((current) =>
                  current === group.id ? null : group.id
                )
              }
            >
              <Text
                style={[
                  styles.metalChipText,
                  metalCategory === group.id && styles.metalChipTextActive,
                ]}
              >
                {group.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {metalCategory === 'otro' ? (
          <>
            <Text style={styles.sectionLabel}>¿QUÉ MATERIAL?</Text>
            <TextInput
              style={styles.inputFull}
              placeholder="Ej: Titanio, Wolframio, Aleación..."
              placeholderTextColor={colors.textMuted}
              value={metalOtherText}
              onChangeText={setMetalOtherText}
              editable={!submitting}
            />
          </>
        ) : null}
        {metalCategory &&
          metalCategory !== 'otro' &&
          METAL_GROUPS.find((g) => g.id === metalCategory)?.variants && (
            <>
              <Text style={styles.sectionLabel}>SUBTIPO</Text>
              <View style={styles.metalGrid}>
                {METAL_GROUPS.find((g) => g.id === metalCategory)!.variants!.map(
                  (variant: string) => (
                    <TouchableOpacity
                      key={variant}
                      style={[
                        styles.metalChip,
                        metalSubtype === variant && styles.metalChipActive,
                      ]}
                      onPress={() =>
                        setMetalSubtype((current) =>
                          current === variant ? null : variant
                        )
                      }
                    >
                      <Text
                        style={[
                          styles.metalChipText,
                          metalSubtype === variant &&
                            styles.metalChipTextActive,
                        ]}
                      >
                        {variant}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </>
          )}
        <Text style={styles.sectionLabel}>CANTIDAD</Text>
        <View style={styles.inputRow}>
          <TextInput style={styles.input} placeholder="Ej: 500" placeholderTextColor={colors.textMuted} value={quantity} onChangeText={setQuantity} keyboardType="numeric" editable={!submitting} />
          <View style={styles.unitRow}>
            <TouchableOpacity style={[styles.unitBtn, unit === 'kg' && styles.unitBtnActive]} onPress={() => setUnit('kg')}>
              <Text style={[styles.unitBtnText, unit === 'kg' && styles.unitBtnTextActive]}>kg</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.unitBtn, unit === 'tn' && styles.unitBtnActive]} onPress={() => setUnit('tn')}>
              <Text style={[styles.unitBtnText, unit === 'tn' && styles.unitBtnTextActive]}>tn</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.sectionLabel}>PRECIO POR KG (ARS)</Text>
        <View style={styles.inputRow}>
          <TextInput style={styles.input} placeholder="Ej: 5200" placeholderTextColor={colors.textMuted} value={price} onChangeText={setPrice} keyboardType="numeric" editable={!priceNegotiable && !submitting} />
          <TouchableOpacity style={[styles.convenirBtn, priceNegotiable && styles.convenirBtnActive]} onPress={() => setPriceNegotiable(!priceNegotiable)}>
            <Text style={[styles.convenirText, priceNegotiable && styles.convenirTextActive]}>$ A convenir</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionLabel}>DESCRIPCIÓN (OPCIONAL)</Text>
        <TextInput style={[styles.input, styles.inputFull]} placeholder="Detalles del material, condiciones..." placeholderTextColor={colors.textMuted} value={description} onChangeText={setDescription} multiline numberOfLines={3} editable={!submitting} />
        <Text style={styles.sectionLabel}>ENTREGA</Text>
        {DELIVERY_OPTIONS.map((opt) => (
          <TouchableOpacity key={opt.id} style={[styles.deliveryOption, delivery === opt.id && styles.deliveryOptionActive]} onPress={() => setDelivery(opt.id === delivery ? null : opt.id)}>
            <Ionicons name={opt.icon} size={20} color={delivery === opt.id ? colors.primary : colors.textSecondary} />
            <Text style={[styles.deliveryText, delivery === opt.id && styles.deliveryTextActive]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
        <Text style={styles.sectionLabel}>UBICACIÓN</Text>
        <TextInput style={styles.inputFull} placeholder="Ciudad, provincia" placeholderTextColor={colors.textMuted} value={location} onChangeText={setLocation} editable={!submitting} />
        <TouchableOpacity style={styles.publishButton} activeOpacity={0.8} onPress={handleSave} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#0D0D0F" /> : <Text style={styles.publishButtonText}>{id ? 'Guardar cambios' : 'Publicar oferta'}</Text>}
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { padding: spacing.md, paddingTop: spacing.sm },
  title: { fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: spacing.lg },
  sectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, color: colors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.sm },
  operationRow: { flexDirection: 'row', gap: spacing.md },
  operationBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.md, backgroundColor: colors.card, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  operationBtnActive: { backgroundColor: 'rgba(246,70,93,0.2)', borderColor: colors.danger },
  operationBtnActiveCompro: { backgroundColor: 'rgba(14,203,129,0.2)', borderColor: colors.success },
  operationBtnText: { color: colors.textSecondary, fontSize: 16, fontWeight: '600' },
  operationBtnTextActive: { color: colors.text, fontWeight: '700' },
  metalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  metalChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.full, backgroundColor: colors.card, borderWidth: 1, borderColor: 'transparent' },
  metalChipActive: { borderColor: colors.primary, backgroundColor: 'rgba(240,185,11,0.1)' },
  metalChipText: { color: colors.text, fontSize: 14 },
  metalChipTextActive: { color: colors.primary, fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  input: { flex: 1, backgroundColor: colors.input, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, color: colors.text, fontSize: 15 },
  inputFull: { backgroundColor: colors.input, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, color: colors.text, fontSize: 15 },
  unitRow: { flexDirection: 'row', gap: 4 },
  unitBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: borderRadius.sm, backgroundColor: colors.card },
  unitBtnActive: { backgroundColor: colors.primary },
  unitBtnText: { color: colors.text, fontSize: 14 },
  unitBtnTextActive: { color: '#0D0D0F', fontWeight: '600' },
  convenirBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderRadius: borderRadius.sm, backgroundColor: colors.card, borderWidth: 1, borderColor: 'transparent' },
  convenirBtnActive: { borderColor: colors.primary },
  convenirText: { color: colors.text, fontSize: 13 },
  convenirTextActive: { color: colors.primary, fontWeight: '600' },
  deliveryOption: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.card, paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: 'transparent' },
  deliveryOptionActive: { borderColor: colors.primary },
  deliveryText: { color: colors.text, fontSize: 15 },
  deliveryTextActive: { color: colors.primary, fontWeight: '600' },
  publishButton: { backgroundColor: colors.primary, paddingVertical: spacing.md, borderRadius: borderRadius.md, alignItems: 'center', marginTop: spacing.xl, minHeight: 52, justifyContent: 'center' },
  publishButtonText: { color: '#0D0D0F', fontSize: 16, fontWeight: '700' },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  loadingText: { color: colors.textSecondary },
});
