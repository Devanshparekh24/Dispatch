import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    StyleSheet
} from 'react-native';
import { useUsersQuery } from '../hooks/useUsers';

const DemoScreen = () => {
    const { data: queryResult, isLoading, isRefetching, refetch } = useUsersQuery();
    
    // Extract server state managed by React Query hook
    const users = queryResult?.data;
    const isMock = queryResult?.isMock || false;
    const error = queryResult?.errorMsg || null;

    // Local UI states
    const [searchQuery, setSearchQuery] = useState('');
    const [sortAsc, setSortAsc] = useState(true);
    const [visiblePasswords, setVisiblePasswords] = useState({});

    // Handle pull-to-refresh using TanStack Query's refetch
    const onRefresh = () => {
        refetch();
    };

    // Toggle password visibility for specific user row
    const togglePassword = (username) => {
        setVisiblePasswords(prev => ({
            ...prev,
            [username]: !prev[username]
        }));
    };

    // Filter and Sort dataset
    const processedUsers = useMemo(() => {
        let list = users ? [...users] : [];

        // Search Filter
        if (searchQuery.trim() !== '') {
            const q = searchQuery.toLowerCase();
            list = list.filter(u =>
                (u.UserName || '').toLowerCase().includes(q)
            );
        }

        // Sorting
        list.sort((a, b) => {
            const nameA = (a.UserName || '').toLowerCase();
            const nameB = (b.UserName || '').toLowerCase();
            if (nameA < nameB) return sortAsc ? -1 : 1;
            if (nameA > nameB) return sortAsc ? 1 : -1;
            return 0;
        });

        return list;
    }, [users, searchQuery, sortAsc]);

    // Skeleton Loader Component
    const renderSkeleton = () => (
        <View className="space-y-4 w-full px-4">
            {[1, 2, 3, 4, 5].map((key) => (
                <View key={key} className="bg-surface border border-slate-800 rounded-xl p-4 flex-row items-center justify-between opacity-60">
                    <View className="space-y-2 flex-1">
                        <View className="h-4 w-28 bg-slate-700 rounded animate-pulse" />
                        <View className="h-3 w-40 bg-slate-800 rounded mt-1.5 animate-pulse" />
                    </View>
                    <View className="h-8 w-14 bg-slate-700 rounded-lg animate-pulse" />
                </View>
            ))}
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-background">
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                {/* Header Section */}
                <View className="px-6 pt-6 pb-4 border-b border-slate-800/80 bg-slate-900/40">
                    <View className="flex-row justify-between items-center">
                        <View>
                            <Text className="text-2xl font-black tracking-wide text-white">
                                User Master
                            </Text>
                            <Text className="text-slate-400 text-xs mt-0.5">
                                Database Directory & Credentials
                            </Text>
                        </View>
                        
                        {/* Live/Mock Connection Status Badge */}
                        {isMock ? (
                            <View className="flex-row items-center bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full">
                                <View className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-2 animate-ping" />
                                <Text className="text-amber-500 text-xs font-semibold">Simulated</Text>
                            </View>
                        ) : (
                            <View className="flex-row items-center bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full">
                                <View className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
                                <Text className="text-emerald-500 text-xs font-semibold">MSSQL Live</Text>
                            </View>
                        )}
                    </View>

                    {/* Offline/Error Notification Panel */}
                    {isMock && error && (
                        <View className="mt-3 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg flex-row justify-between items-center">
                            <Text className="text-red-400 text-xs flex-1 mr-2" numberOfLines={1}>
                                Connect Fail: {error}
                            </Text>
                            <TouchableOpacity 
                                onPress={() => refetch()} 
                                className="bg-red-500/20 px-2 py-1 rounded"
                            >
                                <Text className="text-red-300 text-[10px] font-bold uppercase tracking-wider">Retry</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Filter and Search Controls */}
                <View className="px-6 py-4">
                    <View className="flex-row items-center bg-surface border border-slate-800 rounded-xl px-3 py-1">
                        <Text className="text-slate-500 text-lg">🔍</Text>
                        <TextInput
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholder="Search by username..."
                            placeholderTextColor="#64748B"
                            className="flex-1 text-white text-base ml-2 py-2"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Text className="text-slate-400 text-sm px-2 font-bold">✕</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Table Headers / Action Toolbar */}
                    <View className="flex-row justify-between items-center mt-4 px-1">
                        <Text className="text-slate-400 text-xs font-semibold tracking-wider uppercase">
                            {processedUsers.length} {processedUsers.length === 1 ? 'record' : 'records'} found
                        </Text>
                        <TouchableOpacity
                            onPress={() => setSortAsc(prev => !prev)}
                            className="flex-row items-center bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg"
                        >
                            <Text className="text-indigo-400 text-xs font-medium mr-1">
                                Sort {sortAsc ? 'A-Z ↓' : 'Z-A ↑'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Data Grid / Table Area */}
                {isLoading ? (
                    renderSkeleton()
                ) : (
                    <FlatList
                        data={processedUsers}
                        keyExtractor={(item) => item.UserName || String(Math.random())}
                        contentContainerStyle={styles.listContainer}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefetching}
                                onRefresh={onRefresh}
                                tintColor="#6366F1"
                                colors={['#6366F1']}
                            />
                        }
                        ListEmptyComponent={
                            <View className="items-center justify-center py-16 bg-surface/30 rounded-2xl border border-slate-800/40 border-dashed mx-1">
                                <Text className="text-slate-500 text-3xl mb-2">📂</Text>
                                <Text className="text-slate-300 font-semibold text-base">No Users Found</Text>
                                <Text className="text-slate-500 text-xs mt-1 text-center px-6">
                                    {searchQuery ? 'No records match your search criteria. Try a different query.' : 'The User_Master table has no records.'}
                                </Text>
                            </View>
                        }
                        renderItem={({ item, index }) => {
                            const isVisible = visiblePasswords[item.UserName] || false;
                            return (
                                <View className="bg-surface border border-slate-800/60 rounded-xl p-4 mb-3 flex-row items-center justify-between shadow-sm shadow-black/40">
                                    <View className="flex-1 pr-4">
                                        <Text className="text-white text-base font-bold tracking-wide">
                                            {item.UserName || 'N/A'}
                                        </Text>
                                        <View className="flex-row items-center mt-1">
                                            <Text className="text-slate-400 text-xs mr-2">Password:</Text>
                                            <Text className={`font-mono text-sm ${isVisible ? 'text-indigo-300 font-semibold' : 'text-slate-500'}`}>
                                                {isVisible ? item.Password : '••••••••••••'}
                                            </Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => togglePassword(item.UserName)}
                                        className={`px-3 py-1.5 rounded-lg border ${
                                            isVisible 
                                                ? 'bg-indigo-500/10 border-indigo-500/30' 
                                                : 'bg-slate-800 border-slate-700/60'
                                        }`}
                                    >
                                        <Text className={`text-xs font-semibold ${isVisible ? 'text-indigo-400' : 'text-slate-300'}`}>
                                            {isVisible ? 'Hide' : 'Show'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        }}
                    />
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    listContainer: {
        paddingHorizontal: 24,
        paddingBottom: 32,
    },
});

export default DemoScreen;
