import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '@/config/theme';
import { DELIVERY_OPTIONS } from '@/config/constants';
import { getPublicacionById, updatePublicacion, assertSuccess } from '@/services/api';

const DELIVERY_MAP: Record<string, string> = {
  pickup_now: 'Retiro inmediato',
  pickup_coord: 'Coordinar retiro',
  shipping: 'Envío disponible',
};

export default function EditarPublicacionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [operation, setOperation] = useState<'vendo' | 'compro'>('vendo');
  const [metal, setMetal] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState<'kg' | 'tn'>('kg');
  const [price, setPrice] = useState('');
  const [priceNegotiable, setPriceNegotiable] = useState(false);
  const [description, setDescription] = useState('');
  const [delivery, setDelivery] = useState<string | null>(null);
  const [location, setLocation] = useState('');

  useEffect(() => {
    if (!id) {
      setError('ID no válido');
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await getPublicacionById(String(id));
        if (!res.success || !res.data) {
          setError(res.message ?? 'Publicación no encontrada');
          return;
        }
        const d = res.data as {
          tipo: string;
          metal: string;
          cantidad: number;
          unidad: string;
          precio?: number;
          precioAConvenir?: boolean;
          descripcion?: string;
          entrega?: string;
          ubicacion?: string;
        };
        if (!cancelled) {
          setOperation((d.tipo === 'compro' ? 'compro' : 'vendo') as 'vendo' | 'compro');
          setMetal(d.metal ?? '');
          setQuantity(String(d.cantidad ?? ''));
          setUnit((d.unidad === 'tn' ? 'tn' : 'kg') as 'kg' | 'tn');
          setPrice(d.precio != null ? String(d.precio) : '');
          setPriceNegotiable(!!d.precioAConvenir);
          setDescription(d.descripcion ?? '');
          setLocation(d.ubicacion ?? '');
          const deliveryOpt = DELIVERY_OPTIONS.find((o) => o.label === d.entrega);
          setDelivery(deliveryOpt?.id ?? null);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Error al cargar');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    const metalTrim = metal.trim();
    if (!metalTrim) {
      Alert.alert('Error', 'El material es obligatorio');
      return;
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

    setSaving(true);
    try {
      const precioNum = priceNegotiable ? undefined : parseFloat(price.replace(',', '.'));
      const res = await updatePublicacion(String(id), {
        tipo: operation,
        metal: metalTrim,
        cantidad: qty,
        unidad: unit,
        precio: precioNum,
        precioAConvenir: priceNegotiable,
        descripcion: description.trim() || undefined,
        entrega: delivery ? DELIVERY_MAP[delivery] : undefined,
        ubicacion: location.trim() || undefined,
      });
      assertSuccess(res);
      Alert.alert('Guardado', 'La publicación se actualizó correctamente.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo guardar';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar publicación</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar publicación</Text>
          <View style={styles.headerPlaceholder} />
        </View>
        <View style={styles.loadingWrap}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
            <Text style={styles.retryBtnText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar publicación</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionLabel}>TIPO DE OPERACIÓN</Text>
        <View style={styles.operationRow}>
          <TouchableOpacity
            style={[styles.operationBtn, operation === 'vendo' && styles.operationBtnActive]}
            onPress={() => setOperation('vendo')}
          >
            <Text style={[styles.operationBtnText, operation === 'vendo' && styles.operationBtnTextActive]}>VENDO</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.operationBtn, operation === 'compro' && styles.operationBtnActiveCompro]}
            onPress={() => setOperation('compro')}
          >
            <Text style={[styles.operationBtnText, operation === 'compro' && styles.operationBtnTextActive]}>COMPRO</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>METAL</Text>
        <TextInput
          style={styles.inputFull}
          placeholder="Ej: Cobre - 1ra, Bronce, Titanio..."
          placeholderTextColor={colors.textMuted}
          value={metal}
          onChangeText={setMetal}
          editable={!saving}
        />

        <Text style={styles.sectionLabel}>CANTIDAD</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Ej: 500"
            placeholderTextColor={colors.textMuted}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            editable={!saving}
          />
          <View style={styles.unitRow}>
            <TouchableOpacity
              style={[styles.unitBtn, unit === 'kg' && styles.unitBtnActive]}
              onPress={() => setUnit('kg')}
            >
              <Text style={[styles.unitBtnText, unit === 'kg' && styles.unitBtnTextActive]}>kg</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.unitBtn, unit === 'tn' && styles.unitBtnActive]}
              onPress={() => setUnit('tn')}
            >
              <Text style={[styles.unitBtnText, unit === 'tn' && styles.unitBtnTextActive]}>tn</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionLabel}>PRECIO POR KG (ARS)</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Ej: 5200"
            placeholderTextColor={colors.textMuted}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            editable={!priceNegotiable && !saving}
          />
          <TouchableOpacity
            style={[styles.convenirBtn, priceNegotiable && styles.convenirBtnActive]}
            onPress={() => setPriceNegotiable(!priceNegotiable)}
          >
            <Text style={[styles.convenirText, priceNegotiable && styles.convenirTextActive]}>$ A convenir</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>DESCRIPCIÓN (OPCIONAL)</Text>
        <TextInput
          style={[styles.input, styles.inputFull]}
          placeholder="Detalles del material, condiciones..."
          placeholderTextColor={colors.textMuted}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          editable={!saving}
        />

        <Text style={styles.sectionLabel}>ENTREGA</Text>
        {DELIVERY_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.id}
            style={[styles.deliveryOption, delivery === opt.id && styles.deliveryOptionActive]}
            onPress={() => setDelivery(delivery === opt.id ? null : opt.id)}
          >
            <Ionicons name={opt.icon} size={20} color={delivery === opt.id ? colors.primary : colors.textSecondary} />
            <Text style={[styles.deliveryText, delivery === opt.id && styles.deliveryTextActive]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionLabel}>UBICACIÓN</Text>
        <TextInput
          style={styles.inputFull}
          placeholder="Ciudad, provincia"
          placeholderTextColor={colors.textMuted}
          value={location}
          onChangeText={setLocation}
          editable={!saving}
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color="#0D0D0F" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar cambios</Text>
          )}
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: 4 },
  headerTitle: { color: colors.text, fontSize: 16, fontWeight: '600' },
  headerPlaceholder: { width: 32 },
  container: { flex: 1 },
  content: { padding: spacing.md },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  loadingText: { color: colors.textSecondary },
  errorText: { color: colors.danger, textAlign: 'center', marginBottom: spacing.md },
  retryBtn: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg, backgroundColor: colors.card, borderRadius: borderRadius.md },
  retryBtnText: { color: colors.text, fontWeight: '600' },
  sectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, color: colors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.sm },
  operationRow: { flexDirection: 'row', gap: spacing.md },
  operationBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.md, backgroundColor: colors.card, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  operationBtnActive: { backgroundColor: 'rgba(246,70,93,0.2)', borderColor: colors.danger },
  operationBtnActiveCompro: { backgroundColor: 'rgba(14,203,129,0.2)', borderColor: colors.success },
  operationBtnText: { color: colors.textSecondary, fontSize: 16, fontWeight: '600' },
  operationBtnTextActive: { color: colors.text, fontWeight: '700' },
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
  deliveryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  deliveryOptionActive: { borderColor: colors.primary },
  deliveryText: { color: colors.text, fontSize: 15 },
  deliveryTextActive: { color: colors.primary, fontWeight: '600' },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.xl,
    minHeight: 52,
    justifyContent: 'center',
  },
  saveButtonText: { color: '#0D0D0F', fontSize: 16, fontWeight: '700' },
});
